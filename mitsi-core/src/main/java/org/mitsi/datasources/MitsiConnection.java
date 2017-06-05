package org.mitsi.datasources;

import java.io.Closeable;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.ParameterMapping;
import org.apache.ibatis.session.SqlSession;
import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.commons.pojos.Filter;
import org.mitsi.commons.pojos.OrderByColumn;
import org.mitsi.core.annotations.DefaultOwner;
import org.mitsi.datasources.exceptions.MitsiSecurityException;
import org.mitsi.datasources.helper.TypeHelper;


public class MitsiConnection implements Closeable, IMitsiMapper {
	private static final Logger log = Logger.getLogger(MitsiConnection.class);

	public static final String MITSI_HIDDEN_RNUM_COLUMN = "mitsi_hiden_rnum__"; 

	private static final Pattern forEachFilterPattern = Pattern.compile("__frch_filter_(\\d+).filter");
	
	SqlSession sqlSession = null; 
	IMitsiMapper mapper = null;
	String mapperInterfaceName;
	MitsiDatasource datasource = null;
	
	public MitsiConnection(SqlSession sqlSession, IMitsiMapper mapper, MitsiDatasource datasource) {
		this.sqlSession = sqlSession;
		this.mapper = mapper;
		this.datasource = datasource;
		
		Class[] mapperInterfaces = mapper.getClass().getInterfaces();
		if(mapperInterfaces.length != 1) {
			// with java 8, String.join() would be better
			StringBuilder sb = new StringBuilder();
			for(Class interfac : mapperInterfaces) {
				if(sb.length()>0) {
					sb.append(",");
				}
				sb.append(interfac.getName());
			}
			log.error("mapper has more or less than one interface : "+mapperInterfaces.length+" ("+sb.toString()+")");
		}
		mapperInterfaceName = mapperInterfaces[0].getName();
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
	public List<Constraint> getTableFks(String tableOwner,
			String tableName) {
		tableOwner = getOwner(tableOwner);
		return mapper.getTableFks(tableOwner, tableName);
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
	
	private void setFilterBindVariable(PreparedStatement statement, int iParam, Filter filter) throws SQLException, ParseException {
		if(filter.type == null) {
			statement.setString(iParam, filter.filter);
			return;
		}

		switch(filter.type) {
		case TypeHelper.TYPE_INTEGER :
			statement.setLong(iParam, Long.parseLong(filter.filter));
			break;
		
		case TypeHelper.TYPE_FLOAT :
			statement.setDouble(iParam, Double.parseDouble(filter.filter));
			break;
		
		case TypeHelper.TYPE_DATE :
			SimpleDateFormat parser = new SimpleDateFormat(TypeHelper.DATE_FORMAT);
			Date d = parser.parse(filter.filter);
			statement.setDate(iParam, new java.sql.Date(d.getTime()));
			break;
			
		default :
			statement.setString(iParam, filter.filter);
		}
	}

	
	@SuppressWarnings({"squid:S1226", "squid:S1151", "squid:S134", "squid:S3776", "squid:S1160"}) // this method is complex and SONAR complains about it, but it is OK
	public GetDataResult getData(String owner, String tableName, long fromRow, long count, OrderByColumn[] orderByColumns, Filter[] filters) throws SQLException, MitsiException {
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
		
		// back to JDBC
		List<String[]> results = new ArrayList<>();
		Connection jdbcConnection  = sqlSession.getConnection();

		MappedStatement ms = sqlSession.getConfiguration()
				.getMappedStatement(mapperInterfaceName + ".getData");
		Map<String, Object> params = new HashMap<>();
		params.put("owner", owner);    
		params.put("tableName", tableName);    
		params.put("fromRow", fromRow);
		params.put("count", count);
		params.put("orderByColumns", orderByColumns);
		params.put("filters", filters);
		BoundSql boundSql = ms.getBoundSql(params);
		
		try(PreparedStatement  statement = jdbcConnection.prepareStatement(boundSql.getSql())) {
			statement.setFetchSize(2000); // TODO : à rendre parametrable ?
			int iParam = 0;
			for(ParameterMapping parameterMapping : boundSql.getParameterMappings()) {
				iParam++;
				log.info("parameterMapping #"+iParam+": "+parameterMapping.getExpression()+"/"+parameterMapping.getJdbcTypeName()+"/"+parameterMapping.getProperty()+"/"+parameterMapping.getResultMapId()+"/"+parameterMapping.getNumericScale());
				
				// only fromRow, count and filters may be passed as bind variable
				if("fromRow".equals(parameterMapping.getProperty())) {
					statement.setLong(iParam, fromRow);
				}
				else if("count".equals(parameterMapping.getProperty())) {
					statement.setLong(iParam, count);
				}
				else {
					Matcher matcher = forEachFilterPattern.matcher(parameterMapping.getProperty());
					if(matcher.find()) {
						int iFilter = Integer.parseInt(matcher.group(1));
						Filter filter = filters[iFilter];
						try {
							setFilterBindVariable(statement, iParam, filter);
						}
						catch (ParseException | NumberFormatException  e) {
							log.error("invalid filter format : "+filter.filter+" ("+filter.type+")", e);
							throw new MitsiException("invalid filter format : "+filter.filter+" ("+filter.type+")", e);
						}
					}
					else {
						log.error("impossible to bind parameter for getData() : " + parameterMapping.getProperty());
						throw new MitsiException("impossible to bind parameter for getData() : " + parameterMapping.getProperty());
					}
				}
			}
			
			statement.execute();
			ResultSet resultSet = statement.getResultSet();
			
			// get columns
			ResultSetMetaData rsmd = resultSet.getMetaData();
			List<Column> columns = new ArrayList<>();
			int[] jdbcTypes = new int[rsmd.getColumnCount()-1];
			int[] columnPos = new int[rsmd.getColumnCount()-1];
			for(int i=1; i<rsmd.getColumnCount(); i++) {
				String columnName = rsmd.getColumnName(i);
				if(MITSI_HIDDEN_RNUM_COLUMN.equals(columnName.toLowerCase())) {
					columnPos[i-1] = -1;
					continue;
				}
				Column column = new Column();
				jdbcTypes[i-1] =  rsmd.getColumnType(i);
				column.type = TypeHelper.getTypeFromJdbc(rsmd.getColumnType(i));
				column.name = columnName;
				// TODO : précision ? possible ?
				columnPos[i-1] = columns.size();
				columns.add(column);
			}
			result.columns = columns;
			
			// get data
			while(resultSet.next() ) {
				String[] row = new String[columns.size()];
				for(int i=0; i!=row.length; i++) {
					if(columnPos[i] >= 0) {
						row[columnPos[i]] = TypeHelper.fromJdbcToString(jdbcTypes[i], resultSet, i+1);
					}
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
