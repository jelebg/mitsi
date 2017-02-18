package org.mitsi.core;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeSet;

import javax.sql.DataSource;

import org.mitsi.datasources.IMitsiMapper;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.mapper.oracle.IOracleMapper;
import org.mitsi.users.MitsiDatasources;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.Autowired;
import org.apache.ibatis.datasource.pooled.PooledDataSource;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.TransactionFactory;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;



public class DatasourceManager {
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
					sqlSessionFactory.getConfiguration().addMapper(IOracleMapper.class);
				}
			}
			finally {
				poolsLock.writeLock().unlock();
			}
		}
		
		SqlSession sqlSession = sqlSessionFactory.openSession();
		IMitsiMapper mapper = sqlSession.getMapper(IOracleMapper.class);

		return new MitsiConnection(sqlSession, mapper, datasource);
	}
	
}
