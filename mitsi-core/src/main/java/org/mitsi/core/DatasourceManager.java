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

public class DatasourceManager {
	@Autowired
	private MitsiDatasources mitsiDatasources;

	
	Map<String, SqlSessionFactory> pools = new HashMap<String, SqlSessionFactory>();
	
	public void loadIfNeccessary() {
		mitsiDatasources.loadIfNeccessary();
	}
	
	// TODO : faire plus performant que ce synchonized (la plupart du temps les pools sont deja initialises)
	public synchronized MitsiConnection getConnection(TreeSet<String> userGrantedGroups, boolean isUserConnected, String datasourceName) throws MitsiUsersException {
		MitsiDatasource datasource = mitsiDatasources.getDatasource(userGrantedGroups, isUserConnected, datasourceName);
		if(datasource == null) {
			throw new MitsiUsersException("cannot find datasource "+datasourceName);
		}
		
		SqlSessionFactory sqlSessionFactory = pools.get(datasourceName);
		if(sqlSessionFactory==null) {
			DataSource jdbcDataSource = new PooledDataSource(datasource.getDriver(), 
					datasource.getJdbcUrl(), datasource.getUser(), datasource.getPassword());
			
			TransactionFactory transactionFactory = new JdbcTransactionFactory();
			/* TODO : vérifier à quoi sert le nom de l'environment */
			Environment environment = new Environment(datasource.getName(), transactionFactory, jdbcDataSource);
			Configuration configuration = new Configuration(environment);
			configuration.setCacheEnabled(false);
			
			sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
		}

		sqlSessionFactory.getConfiguration().addMapper(IOracleMapper.class);
		SqlSession sqlSession = sqlSessionFactory.openSession();
		IMitsiMapper mapper = sqlSession.getMapper(IOracleMapper.class);
		if(datasource.getConnectSchema() != null && !datasource.getConnectSchema().isEmpty()) {
			mapper.changeSchema(datasource.getConnectSchema());
		}

		return new MitsiConnection(sqlSession, mapper);
	}
	
}
