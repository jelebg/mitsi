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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import org.mitsi.commons.pojos.OrderByColumn;
import org.mitsi.datasources.exceptions.MitsiSecurityException;
import org.mitsi.datasources.helper.TypeHelper;

public class MitsiConnection implements Closeable, IMitsiMapper {
	private static final Logger log = Logger.getLogger(MitsiConnection.class);

	SqlSession sqlSession = null; 
	IMitsiMapper mapper = null;
	
	public MitsiConnection(SqlSession sqlSession, IMitsiMapper mapper) {
		this.sqlSession = sqlSession;
		this.mapper = mapper;
	}
	
	@Override
	public void close() {
		sqlSession.rollback();
		sqlSession.close();
	}

	public synchronized void rollback() {
		sqlSession.rollback();
	}

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
				log.debug("cannot find table "+i.owner+"."+i.tableName+" for index "+i.owner+"."+i.name);
			}
			else {
				dobj.getIndexes().add(i);
			}
		}
		
		for(Constraint c : constraints) {
			DatabaseObject dobj = doMap.get(new DatabaseObject.Id(null, c.owner, c.tableName));
			if(dobj == null) {
				log.debug("cannot find table "+c.owner+"."+c.tableName+" for index "+c.owner+"."+c.name);
			}
			else {
				dobj.getConstraints().add(c);
			}
			
		}
	}

	public synchronized List<DatabaseObject> getTablesAndViews(String owner) {
		List<DatabaseObject> databaseObjects = mapper.getTablesAndViews(owner);
		getTablesAndViewsSubObjects(databaseObjects);
		return databaseObjects;
	}
	
	@Override
	public synchronized List<DatabaseObject> getTablesAndViewsLight(String owner) {
		List<DatabaseObject> databaseObjects = mapper.getTablesAndViewsLight(owner);
		return databaseObjects;
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
	
	public static void securityCheckDbObject(String tableName) throws MitsiSecurityException {
		// TODO : conserver le pattern pour ne pas le recompiler systématiquement
		
		String regex = "[^a-zA-Z0-9_]";
	    Pattern pattern = Pattern.compile(regex);
	    Matcher match = pattern.matcher(tableName);
		if(match.matches()) {
			log.warn("invalid table name : "+tableName);
			throw new MitsiSecurityException("invalid table name : "+tableName);
		}
	}
	
	public static class GetDataResult {
		public List<Column> columns;
		public List<String[]> results;
	}
	
	public GetDataResult getData(String owner, String tableName, long fromRow, long count, OrderByColumn[] orderByColumns) throws SQLException, MitsiSecurityException {
		securityCheckDbObject(tableName);
		if(owner != null) {
			securityCheckDbObject(owner);
		}
		
		
		GetDataResult result = new GetDataResult();
		
		// TODO : passer par le mapper pour bdd autres qu'oracle
		
		StringBuilder orderByClause = new StringBuilder();
		if(orderByColumns != null) {
			for(OrderByColumn orderByColumn : orderByColumns) {
				if(orderByClause.length()==0) {
					orderByClause.append("ORDER BY ");
				}
				else {
					orderByClause.append(",");
				}
				orderByClause.append(orderByColumn.column);
				if(orderByColumn.ascending) {
					orderByClause.append(" ASC");
				}
				else {
					orderByClause.append(" DESC");
				}
			}
		}
		
		// back to JDBC
		Connection jdbcConnection  = sqlSession.getConnection();
		PreparedStatement  statement = jdbcConnection.prepareStatement(
				"SELECT * FROM ( SELECT rownum rnum, t.* FROM ( "+
							"select * from " + (owner==null?"":owner+".")+tableName+" "+orderByClause.toString()+							
						" ) t where rownum<=?) where rnum>?");
		statement.setLong(1, fromRow+count);
		statement.setLong(2, fromRow);
		statement.execute();
		ResultSet resultSet = statement.getResultSet();
		
		// get columns
		ResultSetMetaData rsmd = resultSet.getMetaData();
		List<Column> columns = new ArrayList<Column>();
		//currentResultSetNbColumns = rsmd.getColumnCount();
		int[] jdbcTypes = new int[rsmd.getColumnCount()-1];
		for(int i=1; i<rsmd.getColumnCount(); i++) {
			Column column = new Column();
			jdbcTypes[i-1] =  rsmd.getColumnType(i+1);
			column.type = TypeHelper.getTypeFromJdbc(rsmd.getColumnType(i+1));
			column.name = rsmd.getColumnName(i+1);
			// TODO : précision ? possible ?
			columns.add(column);
		}
		result.columns = columns;
		
		// get data
		List<String[]> results = new ArrayList<>();
		while(resultSet.next() ) {
			String[] row = new String[jdbcTypes.length];
			for(int i=0; i!=row.length; i++) {
				row[i] = TypeHelper.fromJdbcToString(jdbcTypes[i], resultSet, i+2);
			}
			results.add(row);
		}
		
		result.results = results;
		
		return result;
	}
	
}
