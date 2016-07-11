package org.mitsi.datasources;

import java.io.Closeable;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.apache.ibatis.datasource.pooled.PooledDataSource;
import org.apache.ibatis.datasource.unpooled.UnpooledDataSource;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.ResultContext;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.TransactionFactory;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;
import org.apache.log4j.Logger;
import org.mitsi.datasources.exceptions.MitsiDatasourceException;
import org.mitsi.datasources.helper.TypeHelper;
import org.mitsi.datasources.mapper.oracle.IOracleMapper;

public class MitsiConnection implements Closeable, IMitsiMapper {
	private static final Logger log = Logger.getLogger(MitsiConnection.class);

	//MitsiDatasource datasource;
	//Connection connection = null;
	//DataSource jdbcDataSource = null;
	//SqlSessionFactory sqlSessionFactory = null;
	SqlSession sqlSession = null; 
	IMitsiMapper mapper = null;
	//PreparedStatement currentStatement = null; // TODO : permettre d'ouvrir plusieurs statements, un par page/tabulation/autre chose ?
	//ResultSet currentResultSet = null;// TODO : permettre d'ouvrir plusieurs statements, un par page/tabulation/autre chose ?
	//int currentResultSetNbColumns = 0;
	//int [] currentResultSetJdbTypes = null;
	
	public MitsiConnection(SqlSession sqlSession, IMitsiMapper mapper) {
		this.sqlSession = sqlSession;
		this.mapper = mapper;
	}
	/*public MitsiConnection(MitsiDatasource datasource) {
		this.datasource = datasource;
	}
	
	public MitsiDatasource getDatasource() {
		return datasource;
	}*/
	
	
	/*public void connect() throws SQLException, ClassNotFoundException {
		//Class.forName(datasource.getDriver());
		//connection = DriverManager.getConnection(
		//		datasource.getJdbcUrl(),
		//		datasource.getUser(),
		//		datasource.getPassword());
		
		TODO : 1 pool pour une MitsiConnection ou 1 pool pour N MitsiConnection
		
		jdbcDataSource = new PooledDataSource(datasource.getDriver(), 
				datasource.getJdbcUrl(), datasource.getUser(), datasource.getPassword());
		//connection = jdbcDataSource.getConnection();
		
		TransactionFactory transactionFactory = new JdbcTransactionFactory();
		// TODO : vérifier à quoi sert le nom de l'environment 
		Environment environment = new Environment(datasource.getName(), transactionFactory, jdbcDataSource);
		Configuration configuration = new Configuration(environment);
		configuration.setCacheEnabled(false);
		
		//java.util.Properties props = new java.util.Properties();
		//props.put("v$session.program", "MITSI");
		//configuration.setVariables(props);

		//configuration.setMultipleResultSetsEnabled(multipleResultSetsEnabled); TODO : voir si ça sert a quelque chose
		//configuration.addMappers("mapper.oracle");
		// TODO : a rajouter
		sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
		sqlSessionFactory.getConfiguration().addMapper(IOracleMapper.class);
		sqlSession = sqlSessionFactory.openSession();
		mapper = sqlSession.getMapper(IOracleMapper.class);
		if(datasource.getConnectSchema() != null && !datasource.getConnectSchema().isEmpty()) {
			mapper.changeSchema(datasource.getConnectSchema());
		}
	}
	
	/*public void clearCache() {
		sqlSession.clearCache();
	}*/
	
	@Override
	public void close() {
		sqlSession.rollback();
		sqlSession.close();
	}
	
	//public IMitsiMapper getMapper() {
	//	return mapper;
	//}

	public synchronized void rollback() {
		sqlSession.rollback();
	}

	/* "pour l'instant" on supprime les fonctionnalités de l'onget SQL 
	 
	public synchronized void commit() {
		sqlSession.commit();
		
	}
	
	
	public synchronized List<Column> rawSelectBegin(String sql) throws SQLException, MitsiDatasourceException { // TODO : parameters
		if(currentResultSet != null) {
			rawSelectEndQuietly();
		}
		
		// back to JDBC
		Connection jdbcConnection = sqlSession.getConnection();
		currentStatement  = jdbcConnection.prepareStatement(sql);
		if(!currentStatement.execute()) {
			throw new MitsiDatasourceException("not a SELECT : '"+sql+"'");
		}
		
		currentResultSet = currentStatement.getResultSet();
		ResultSetMetaData rsmd = currentResultSet.getMetaData();
		List<Column> columns = new ArrayList<Column>();
		//currentResultSetNbColumns = rsmd.getColumnCount();
		currentResultSetJdbTypes = new int[rsmd.getColumnCount()];
		for(int i=0; i!=rsmd.getColumnCount(); i++) {
			Column column = new Column();
			currentResultSetJdbTypes[i] =  rsmd.getColumnType(i+1);
			column.type = TypeHelper.getTypeFromJdbc(rsmd.getColumnType(i+1));
			column.name = rsmd.getColumnName(i+1);
			// TODO : précision ? possible ?
			columns.add(column);
		}
		return columns;
	}
	
	public synchronized List<String[]> rawSelectFetch(int nbRowToFetch) throws SQLException, MitsiDatasourceException { 
		// TODO : renvoyer autre chose que des strings pour gérer les blogs, long, etc.
		if(currentStatement == null) {
			throw new MitsiDatasourceException("no current statement for connection");
		}
		
		List<String[]> results = new ArrayList<String[]>();
		while(nbRowToFetch>0 && currentResultSet.next() ) {
			nbRowToFetch--;
			String[] result = new String[currentResultSetJdbTypes.length];
			for(int i=0; i!=currentResultSetJdbTypes.length; i++) {
				result[i] = TypeHelper.fromJdbcToString(currentResultSetJdbTypes[i], currentResultSet, i+1);
			}
			results.add(result);
		}
		return results;
	}
	
	public synchronized void rawSelectEnd() throws SQLException, MitsiDatasourceException {
		if(currentStatement == null) {
			throw new MitsiDatasourceException("no current statement for connection");
		}

		currentResultSet.close();
		currentStatement.close();
		currentResultSet = null;
		currentStatement = null;
		//currentResultSetNbColumns = 0;
		currentResultSetJdbTypes = null;
	}
	
	public synchronized void rawSelectEndQuietly()   {
		
			if(currentResultSet != null) {
				try {
					currentResultSet.close();
				} catch (SQLException e) {
					// quiet
				}
			}
			if(currentStatement != null) {
				try {
					currentStatement.close();
				} catch (SQLException e) {
					// quiet
				}
			}
			//currentResultSetNbColumns = 0;
			currentResultSetJdbTypes = null;

	}*/

	
	@Override
	public synchronized String testOK() {
		return mapper.testOK();
	}

	// TODO : supprimer car on ne garde plus la connexion ouverte sur un schéma
	@Override
	public synchronized void changeSchema(String schema) {
		mapper.changeSchema(schema);
	}

	@Override
	public synchronized List<Schema> getAllSchemas() {
		return mapper.getAllSchemas();
	}
	
	private void getTablesAndViewsSubObjects(List<DatabaseObject> databaseObjects) {
		List<Index> indexes = mapper.getSchemaIndexes(null);
		List<Constraint> constraints = mapper.getSchemaConstraints(null);

		Map<DatabaseObject.Id, DatabaseObject> doMap = new HashMap<>();
		for(DatabaseObject dobj : databaseObjects) {
			doMap.put(dobj.getId(), dobj);
		}
		
		for(Index i : indexes) {
			DatabaseObject dobj = doMap.get(new DatabaseObject.Id(null, i.owner, i.tableName));
			if(dobj == null) {
				log.warn("cannot find table "+i.owner+"."+i.tableName+" for index "+i.owner+"."+i.name);
			}
			else {
				dobj.getIndexes().add(i);
			}
		}
		
		for(Constraint c : constraints) {
			DatabaseObject dobj = doMap.get(new DatabaseObject.Id(null, c.owner, c.tableName));
			if(dobj == null) {
				log.warn("cannot find table "+c.owner+"."+c.tableName+" for index "+c.owner+"."+c.name);
			}
			else {
				dobj.getConstraints().add(c);
			}
			
		}
	}

	// pas d'override ici pour cause de gestion de cache explicite (disableCaching)
	public synchronized List<DatabaseObject> getTablesAndViews(String owner, boolean disableCaching) {
		/* TODO : revoir le systeme de cache 
		 if(datasource.isUseSchemaCache()) {
		 	log.info("use of cache for owner "+owner);
			Date begining = new Date();

			MitsiDatasource.Cache cache = null;
			if(disableCaching) {
				log.info("cache refresh for owner "+owner);
			}
			else {
				cache = datasource.getCache(owner);
			}
			if(cache == null) {
				log.info("cache init for owner "+owner+" date="+begining);
				cache = datasource.new Cache();
				cache.databaseObjects = mapper.getTablesAndViews(owner);
				getTablesAndViewsSubObjects(cache.databaseObjects);
				cache.lastCacheUpdate = begining;
				datasource.setCache(owner, cache);
			}
			else {
				Date lastSchemaUpdate =  mapper.getLastSchemaUpdateTime(owner).get(0);
				if(lastSchemaUpdate.after(cache.lastCacheUpdate)) {
					log.info("cache update for owner "+owner+" date="+begining);
					cache.databaseObjects = mapper.getTablesAndViews(owner);
					getTablesAndViewsSubObjects(cache.databaseObjects);
					cache.lastCacheUpdate = begining;
				}
				else {
					log.info("cache hit for owner "+owner);
				}
			}
			return cache.databaseObjects;
		}
		
		log.info("cache not used for owner "+owner);
		*/
		
		List<DatabaseObject> databaseObjects = mapper.getTablesAndViews(owner);
		getTablesAndViewsSubObjects(databaseObjects);
		return databaseObjects;
	}
	
	@Override
	public synchronized List<DatabaseObject> getTablesAndViews(String owner) {
		return getTablesAndViews(owner, false);
	}

	@Override
	public synchronized List<DatabaseObject> getTablesDetails() {
		return mapper.getTablesDetails();
	}

	@Override
	public synchronized List<DatabaseObject> getViewsDetails() {
		return mapper.getViewsDetails();
	}

	@Override
	public synchronized List<DatabaseObject> getMatViewsDetails() {
		return mapper.getMatViewsDetails();
	}

	@Override
	public synchronized List<Schema> getSchemasDetails() {
		return mapper.getSchemasDetails();
	}

	@Override
	public synchronized List<Tablespace> getTablespaceDetails() {
		return mapper.getTablespaceDetails();
	}

	@Override
	public synchronized List<Column> getTableColumnsDetails(String owner, String name) {
		return mapper.getTableColumnsDetails(owner, name);
	}

	@Override
	public synchronized List<Column> getTablePartitioninKeysDetails(String owner, String name) {
		return mapper.getTablePartitioninKeysDetails(owner, name);
	}
	
	@Override
	public synchronized List<Index> getTableIndexesDetails(String tableOwner,
			String tableName) {
		return mapper.getTableIndexesDetails(tableOwner, tableName);
	}

	@Override
	public synchronized List<Partition> getTablePartitionDetails(String tableOwner,
			String tableName) {
		return mapper.getTablePartitionDetails(tableOwner, tableName);
	}

	@Override
	public synchronized List<Constraint> getTableConstraintsDetails(String tableOwner,
			String tableName) {
		return mapper.getTableConstraintsDetails(tableOwner, tableName);
	}

	@Override
	public List<Date> getLastSchemaUpdateTime(String owner) {
		return mapper.getLastSchemaUpdateTime(owner);
	}

	@Override
	public List<Constraint> getTablesWithConstraintsTo(String tableOwner,
			String tableName) {
		return mapper.getTablesWithConstraintsTo(tableOwner, tableName);
	}

	@Override
	public List<Relation> getAllRelations() {
		List<Relation> relations = mapper.getAllRelations();
		
		for(Relation relation : relations) {
			if(relation.keyColumnsStr != null) {
				relation.keyColumns = Arrays.asList(relation.keyColumnsStr.split(","));
			}
			if(relation.rKeyColumnsStr != null) {
				relation.rKeyColumns = Arrays.asList(relation.rKeyColumnsStr.split(","));
			}
		}
		
		return relations;
	}

	@Override
	public List<Index> getSchemaIndexes(String schema) {
		return mapper.getSchemaIndexes(schema);
	}

	@Override
	public List<Constraint> getSchemaConstraints(String schema) {
		return mapper.getSchemaConstraints(schema);
	}
	
	/*public void testOK() {
		//boolean ret = false;
		//try {
			//String str = sqlSession.selectOne("testOK" /*"mapper.oracle.testOK"* /);
			String str = mapper.testOK();
			if(str != null) {
				log.debug("mapper.testOK : '"+str+"'");
				//ret = true;
			}
			
			//Statement stmt = connection.createStatement();
			//ResultSet rs = stmt.executeQuery("select 1 from dual");
			
			//if(rs.next()) {
			//	ret = true;
			//}
			
		//} catch(Exception e) {
		//	e.printStackTrace();
		//	ret = false;
		//}
		//return ret;
	}*/

	/* TODO 
	public List<DatabaseObject> getTables() {
		
	}
	public List<DatabaseObject> getTablesAndColumns() {
		
	}
	public List<DatabaseObject> getTablesAndLinkedObjets() {
		
	}
	public List<DatabaseObject> getUserObjets() {
		
	}
	public List<DatabaseObject> getAllObjets() {
		
	}
	*/
	
	/*public List<DatabaseObject> getTablesAndViews() {
		return mapper.getTablesAndViews();
	}*/
	
}
