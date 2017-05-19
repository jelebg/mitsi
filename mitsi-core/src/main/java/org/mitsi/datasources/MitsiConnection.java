package org.mitsi.datasources;

import java.io.Closeable;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.ibatis.session.SqlSession;
import org.apache.log4j.Logger;
import org.mitsi.commons.pojos.Filter;
import org.mitsi.commons.pojos.OrderByColumn;
import org.mitsi.core.annotations.DefaultOwner;
import org.mitsi.datasources.exceptions.MitsiSecurityException;
import org.mitsi.datasources.helper.TypeHelper;


public class MitsiConnection implements Closeable, IMitsiMapper {
	private static final Logger log = Logger.getLogger(MitsiConnection.class);

	// ces constantes ne servent plus que pour getData(). TODO : a supprimer
	public static final String PROVIDER_ORACLE_11G = "oracle_11g";
	public static final String PROVIDER_POSTGRE = "postgre";

	SqlSession sqlSession = null; 
	IMitsiMapper mapper = null;
	MitsiDatasource datasource = null;
	
	public MitsiConnection(SqlSession sqlSession, IMitsiMapper mapper, MitsiDatasource datasource) {
		this.sqlSession = sqlSession;
		this.mapper = mapper;
		this.datasource = datasource;	
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
	
	private String getOwner(String owner) {
		if(owner == null) {
			Class<?>[] interfaces = mapper.getClass().getInterfaces();
			for(Class<?> i : interfaces) {
				DefaultOwner defaultOwner = i.getAnnotation(DefaultOwner.class);
				if(defaultOwner != null) {
					return defaultOwner.value().toUpperCase();
				}
			}

			return datasource.getConnectSchema().toUpperCase();
		}
		return owner.toUpperCase();

	}

	@Override
	@SuppressWarnings("squid:S1226") 
	public synchronized List<Schema> getAllSchemas(String owner) {
		owner = getOwner(owner);
		return mapper.getAllSchemas(owner);
	}
	
	@SuppressWarnings("squid:S1226") 
	private void getTablesAndViewsSubObjects(List<DatabaseObject> databaseObjects, String owner) {
		owner = getOwner(owner);
		List<Index> indexes = mapper.getSchemaIndexes(owner);
		List<Constraint> constraints = mapper.getSchemaConstraints(owner);

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

	@Override
	@SuppressWarnings("squid:S1226") 
	public synchronized List<DatabaseObject> getTablesAndViews(String owner) {
		owner = getOwner(owner);
		List<DatabaseObject> databaseObjects = mapper.getTablesAndViews(owner);
		getTablesAndViewsSubObjects(databaseObjects, owner);
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
	public synchronized List<Sequence> getSequencesDetails() {
		return mapper.getSequencesDetails();
	}

	@Override
	@SuppressWarnings("squid:S1226") 
	public synchronized List<Column> getTableColumnsDetails(String owner, String name) {
		owner = getOwner(owner);
		return mapper.getTableColumnsDetails(owner, name);
	}

	@Override
	@SuppressWarnings("squid:S1226") 
	public synchronized List<Column> getTablePartitioninKeysDetails(String owner, String name) {
		owner = getOwner(owner);
		return mapper.getTablePartitioninKeysDetails(owner, name);
	}
	
	@Override
	@SuppressWarnings("squid:S1226") 
	public synchronized List<Index> getTableIndexesDetails(String tableOwner,
			String tableName) {
		tableOwner = getOwner(tableOwner);
		return mapper.getTableIndexesDetails(tableOwner, tableName);
	}

	@Override
	@SuppressWarnings("squid:S1226") 
	public synchronized List<Partition> getTablePartitionDetails(String tableOwner,
			String tableName) {
		tableOwner = getOwner(tableOwner);
		return mapper.getTablePartitionDetails(tableOwner, tableName);
	}

	@Override
	@SuppressWarnings("squid:S1226") 
	public synchronized List<Constraint> getTableConstraintsDetails(String tableOwner,
			String tableName) {
		tableOwner = getOwner(tableOwner);
		return mapper.getTableConstraintsDetails(tableOwner, tableName);
	}

	@Override
	@SuppressWarnings("squid:S1226") 
	public List<Constraint> getTablesWithConstraintsTo(String tableOwner,
			String tableName) {
		tableOwner = getOwner(tableOwner);
		return mapper.getTablesWithConstraintsTo(tableOwner, tableName);
	}

	@Override
	@SuppressWarnings("squid:S1226") 
	public List<Index> getSchemaIndexes(String schema) {
		schema = getOwner(schema);
		return mapper.getSchemaIndexes(schema);
	}

	@Override
	@SuppressWarnings("squid:S1226") 
	public List<Constraint> getSchemaConstraints(String schema) {
		schema = getOwner(schema);
		return mapper.getSchemaConstraints(schema);
	}
	
	public static void securityCheckDbObject(String tableName) throws MitsiSecurityException {
		// TODO : conserver le pattern pour ne pas le recompiler systématiquement
		
		String regex = "[^a-zA-Z0-9_]";
	    Pattern pattern = Pattern.compile(regex);
	    Matcher match = pattern.matcher(tableName);
		if(match.matches()) {
			log.warn("invalid name : "+tableName);
			throw new MitsiSecurityException("invalid name : "+tableName);
		}
	}
	
	@SuppressWarnings("squid:ClassVariableVisibilityCheck") 
	public static class GetDataResult {
		public List<Column> columns;
		public List<String[]> results;
	}
	
	@SuppressWarnings({"squid:S1226", "squid:S1151", "squid:S134", "squid:S3776", "squid:S1160"}) // this method is complex and SONAR complains about it, but it is OK
	public GetDataResult getData(String owner, String tableName, long fromRow, long count, OrderByColumn[] orderByColumns, Filter[] filters) throws SQLException, MitsiSecurityException {
		securityCheckDbObject(tableName);
		owner = getOwner(owner);
		securityCheckDbObject(owner);

		if(orderByColumns != null) {
			for(OrderByColumn orderByColumn : orderByColumns) {
				securityCheckDbObject(orderByColumn.column);
			}
		}
		if(filters != null) {
			for(Filter filter : filters) {
				securityCheckDbObject(filter.name);
			}
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
					orderByClause.append(" ASC ");
				}
				else {
					orderByClause.append(" DESC ");
				}
			}
		}
		
		StringBuilder whereClause = new StringBuilder();
		if(filters != null) {
			for(Filter filter : filters) {
				if(whereClause.length() == 0) {
					whereClause.append(" where ");
				}
				else {
					whereClause.append(" and ");
				}
				whereClause.append(filter.name);
				whereClause.append(" = ? ");
			}
		}
		
		// back to JDBC
		List<String[]> results = new ArrayList<>();
		Connection jdbcConnection  = sqlSession.getConnection();

		// TODO : use mapper for getData
		String statementStr = null;
		int firstColumnsIndex = 0;
		switch(datasource.getProvider()) {
		// TODO : utiliser offset / fetch pour Oracle ?
			case PROVIDER_ORACLE_11G :
				statementStr = 
				 		"SELECT * FROM ( SELECT rownum rnum, t.* FROM ( "+
						"select * from " + owner + "." + tableName + " " +
						whereClause.toString()   +
						orderByClause.toString() +							
						" ) t where rownum<=?) where rnum>?";
				firstColumnsIndex = 1;
				break;
				
			case PROVIDER_POSTGRE :	
			default: // by default use offset/fetch first syntax
				statementStr = 
					"select * from " + owner + ".\"" + tableName + "\" " +
					whereClause.toString()   +
					orderByClause.toString() +							
					" offset ? limit ?  ";
					break;
		}
				
		try(PreparedStatement  statement = jdbcConnection.prepareStatement(statementStr)) {
			
			int iParam = 1;
			if(filters != null) {
				for(Filter filter : filters) {
					// TODO : gérer les dates
					if(filter.type!=null && filter.type.equals(TypeHelper.TYPE_INTEGER)) {
						statement.setLong(iParam++, Long.parseLong(filter.filter));
					}
					else {
						statement.setString(iParam++, filter.filter);
					}
				}
			}
			switch(datasource.getProvider()) {
				case PROVIDER_ORACLE_11G :
					statement.setLong(iParam++, fromRow+count);
					statement.setLong(iParam++, fromRow);
					break;
					
				case PROVIDER_POSTGRE :	
				default: // by default use offset/fetch first syntax
					statement.setLong(iParam++, fromRow);
					statement.setLong(iParam++, count);
					break;
			}

			statement.execute();
			ResultSet resultSet = statement.getResultSet();
			
			// get columns
			ResultSetMetaData rsmd = resultSet.getMetaData();
			List<Column> columns = new ArrayList<>();
			int[] jdbcTypes = new int[rsmd.getColumnCount()-1];
			for(int i=1; i<rsmd.getColumnCount(); i++) {
				Column column = new Column();
				jdbcTypes[i-1] =  rsmd.getColumnType(i+firstColumnsIndex);
				column.type = TypeHelper.getTypeFromJdbc(rsmd.getColumnType(i+firstColumnsIndex));
				column.name = rsmd.getColumnName(i+firstColumnsIndex);
				// TODO : précision ? possible ?
				columns.add(column);
			}
			result.columns = columns;
			
			// get data
			while(resultSet.next() ) {
				String[] row = new String[jdbcTypes.length];
				for(int i=0; i!=row.length; i++) {
					row[i] = TypeHelper.fromJdbcToString(jdbcTypes[i], resultSet, i+1+firstColumnsIndex);
				}
				results.add(row);
			}
		}
		
		result.results = results;
		
		return result;
	}
	
	public long getMaxExportRows() {
		return datasource.getMaxExportRows();
	}
	
}
