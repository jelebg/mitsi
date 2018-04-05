package org.mitsi.api;

import java.beans.PropertyVetoException;
import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

import org.mitsi.api.annotations.MitsiProviderMapper;
import org.mitsi.api.datasources.IMitsiMapper;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.exceptions.MitsiDatasourceException;
import org.mitsi.users.MitsiDatasources;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.type.filter.AnnotationTypeFilter;

import com.mchange.v2.c3p0.ComboPooledDataSource;

import org.apache.commons.io.FileUtils;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.TransactionFactory;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;
import org.apache.log4j.Logger;

import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;



public class DatasourceManager {
	private static final Logger log = Logger.getLogger(MitsiConnection.class);

	Map<String, Class<?>> mappers = new HashMap<>();
	
	public static final String MITSI_PLUGIN_DIRS = "MITSI_PLUGIN_DIRS";
	public static final String MITSI_PLUGIN_DIRS_SEPARATOR = ";";
	public static final String[] JAR_EXTENSIONS = { "jar" };
	
	private ClassLoader pluginClassLoader = this.getClass().getClassLoader();
	
	private List<URL> getJars(String[] dirs) {
		List<URL> jarsUrls = new ArrayList<URL>();
		
		for(String dir : dirs) {
			File fd = new File(dir);
			if(!fd.exists() || !fd.isDirectory()) {
				continue;
			}
			
			@SuppressWarnings("unchecked")
			Collection<File> jars = (Collection<File>) FileUtils.listFiles(fd, JAR_EXTENSIONS, false);
			for(File jar : jars) {
				try {
					log.info("plugin found : "+jar);
					jarsUrls.add(jar.toURI().toURL());
				} catch (MalformedURLException e) {
					log.warn("invalid URL for file "+jar.getName());
				}
			}
		}
		
		return jarsUrls;
	}
	
	private void loadPlugins()  {
		String mitsiPluginDirs = System.getenv(MITSI_PLUGIN_DIRS);
		log.info("mitsiPluginDirs : "+mitsiPluginDirs);
		if(mitsiPluginDirs==null || mitsiPluginDirs.isEmpty()) {
			return;
		}
		
		String [] mitsiPluginDirsList = mitsiPluginDirs.split(MITSI_PLUGIN_DIRS_SEPARATOR);
		List<URL> urls = getJars(mitsiPluginDirsList);
		if(urls.isEmpty()) {
			return;
		}
		
		ClassLoader cl = IMitsiMapper.class.getClassLoader();
		pluginClassLoader = URLClassLoader.newInstance(urls.toArray(new URL[urls.size()]), cl);
	}
	
	void registerMappers() {
		loadPlugins();

		ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false) {
		    @Override
		    protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
		        return true;
		    }
		};
		scanner.setResourceLoader(new PathMatchingResourcePatternResolver(pluginClassLoader));
		scanner.addIncludeFilter(new AnnotationTypeFilter(MitsiProviderMapper.class));
		

		Set<BeanDefinition> sbd = scanner.findCandidateComponents("org.mitsi.datasources.mapper");
		for (BeanDefinition bd : sbd) {
		    try {
				Class<?> mapperClass = pluginClassLoader.loadClass(bd.getBeanClassName());
				
				MitsiProviderMapper mapperAnnotation = mapperClass.getAnnotation(MitsiProviderMapper.class);
				if(mapperAnnotation != null) {
					boolean inheritsIMitsiMapper = false;
					for(Class<?> interfac : mapperClass.getInterfaces()) {
						if(interfac.equals(IMitsiMapper.class)) {
							inheritsIMitsiMapper = true;
						}
					}
					
					if(!inheritsIMitsiMapper) {
						log.error("type "+mapperClass+" is annotated by MitsiProviderMapper but does not inherit IMitsiMapper");
					}
					else {
					    for (String providerName : mapperAnnotation.value()) {
					        String providerNameLC = providerName.toLowerCase();
                            log.info("registered mapper : '"+providerNameLC+"' - " + mapperClass);
                            mappers.put(providerNameLC, mapperClass);
                        }
					}
				}
			} catch (ClassNotFoundException e) {
				// never happens (really)
				log.warn("unexpected (really) exception", e);
			}
		}		
	}
	
	@PostConstruct
	private void postConstruct() {
		registerMappers();
	}
	
	private Class<?> getMapper(String datasourceProvider) throws MitsiUsersException {
		
		Class<?> mapper = mappers.get(datasourceProvider.toLowerCase());
		if(mapper == null) {
			log.error("unknown provider : '"+datasourceProvider+"'");
			throw new MitsiUsersException("unknown provider : '"+datasourceProvider+"'");
		}
		
		return mapper;
	}
	
	@Autowired
	private MitsiDatasources mitsiDatasources;
	
	ReadWriteLock poolsLock;
	Map<String, SqlSessionFactory> pools = new HashMap<String, SqlSessionFactory>();

	public DatasourceManager() {
		poolsLock = new ReentrantReadWriteLock();
	}
	
	public void loadIfNecessary() {
		mitsiDatasources.loadIfNecessary();
	}
	
	private SqlSessionFactory buildConnectionFactory(String datasourceName, MitsiDatasource datasource) throws MitsiDatasourceException, MitsiUsersException {
		SqlSessionFactory sqlSessionFactory = null;
		
		try {
			poolsLock.writeLock().lock();
		
			sqlSessionFactory = pools.get(datasourceName);
			if(sqlSessionFactory==null) {

				ComboPooledDataSource cpds= new ComboPooledDataSource();
				DataSource jdbcDataSource = cpds;
				try {
					cpds.setForceUseNamedDriverClass(true);
					cpds.setCustomClassLoader(pluginClassLoader);
					cpds.setDriverClass(datasource.getDriver());
				} catch (PropertyVetoException e) {
					throw new MitsiDatasourceException("exception while setDriverClass for ComboPooledDataSource", e);
				}
				cpds.setJdbcUrl(datasource.getJdbcUrl());
				cpds.setUser(datasource.getUser());
				cpds.setPassword(datasource.getPassword());
				cpds.setInitialPoolSize((int) datasource.getPoolInitialSize());
				cpds.setMinPoolSize((int) datasource.getPoolMinSize());
				cpds.setMaxPoolSize((int) datasource.getPoolMaxSize());
				cpds.setMaxIdleTime((int) datasource.getPoolMaxIdleTimeSec());
				cpds.setAcquireIncrement((int) datasource.getPoolAcquireIncrement());
				
				TransactionFactory transactionFactory = new JdbcTransactionFactory();
				/* TODO : vérifier à quoi sert le nom de l'environment */
				Environment environment = new Environment(datasource.getName(), transactionFactory, jdbcDataSource);
				Configuration configuration = new Configuration(environment);
				configuration.setCacheEnabled(false);
				
				sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
				
				pools.put(datasourceName, sqlSessionFactory);
				sqlSessionFactory.getConfiguration().addMapper(getMapper(datasource.getProvider()));
			}
		}
		finally {
			poolsLock.writeLock().unlock();
		}
		
		return sqlSessionFactory;
	}
	
	public MitsiConnection getConnection(SortedSet<String> userGrantedGroups, boolean isUserConnected, String datasourceName) throws MitsiUsersException, MitsiDatasourceException {
		MitsiDatasource datasource = mitsiDatasources.getDatasource(userGrantedGroups, isUserConnected, datasourceName);
		if(datasource == null) {
			throw new MitsiUsersException("cannot find datasource "+datasourceName);
		}
		
		SqlSessionFactory sqlSessionFactory = null;
		try {
			poolsLock.readLock().lock();
			sqlSessionFactory = pools.get(datasourceName);
		}
		finally {
			poolsLock.readLock().unlock();
		}
		
		if(sqlSessionFactory==null) {
			sqlSessionFactory = buildConnectionFactory(datasourceName, datasource);
		}
		
		try {
			SqlSession sqlSession = sqlSessionFactory.openSession();
			IMitsiMapper mapper = (IMitsiMapper) sqlSession.getMapper(getMapper(datasource.getProvider()));
			return new MitsiConnection(sqlSession, mapper, datasource);
		}
		catch(Exception e) {
			throw new MitsiUsersException("could not connect to database : "+datasourceName); // TODO : rajouter un message plus détaillé 
		}

	}
	
}
