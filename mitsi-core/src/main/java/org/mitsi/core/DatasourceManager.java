package org.mitsi.core;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

import org.mitsi.core.annotations.MitsiProviderMapper;
import org.mitsi.datasources.IMitsiMapper;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.users.MitsiDatasources;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.apache.ibatis.datasource.pooled.PooledDataSource;
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
	
	@PostConstruct
	private void postConstruct() {
		ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false) {
		    @Override
		    protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
		        return true;
		    }
		};
		scanner.addIncludeFilter(new AnnotationTypeFilter(MitsiProviderMapper.class));

		Set<BeanDefinition> sbd = scanner.findCandidateComponents("org.mitsi.datasources.mapper");
		for (BeanDefinition bd : sbd) {
		    try {
				Class<?> mapperClass = Class.forName(bd.getBeanClassName());
				
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
						log.info("registered mapper : '"+mapperAnnotation.value()+"' - "+mapperClass);
						mappers.put(mapperAnnotation.value().toLowerCase(), mapperClass);
					}
				}
			} catch (ClassNotFoundException e) {
				// never happens (really)
			}
		}
		
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
	
	public void loadIfNeccessary() {
		mitsiDatasources.loadIfNeccessary();
	}
	
	public MitsiConnection getConnection(TreeSet<String> userGrantedGroups, boolean isUserConnected, String datasourceName) throws MitsiUsersException {
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
			try {
				poolsLock.writeLock().lock();
			
				sqlSessionFactory = pools.get(datasourceName);
				if(sqlSessionFactory==null) {
					DataSource jdbcDataSource = new PooledDataSource(datasource.getDriver(), 
							datasource.getJdbcUrl(), datasource.getUser(), datasource.getPassword());
					
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
		}
		
		SqlSession sqlSession = sqlSessionFactory.openSession();
		IMitsiMapper mapper = (IMitsiMapper) sqlSession.getMapper(getMapper(datasource.getProvider()));

		return new MitsiConnection(sqlSession, mapper, datasource);
	}
	
}
