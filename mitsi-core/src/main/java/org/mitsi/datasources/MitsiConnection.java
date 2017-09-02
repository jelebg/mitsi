package org.mitsi.datasources;

import java.io.Closeable;
import java.lang.reflect.Method;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
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
import org.mitsi.core.annotations.ColumnDisplayType;
import org.mitsi.core.annotations.DefaultOwner;
import org.mitsi.core.annotations.DefaultOwnerIsConnectedUser;
import org.mitsi.core.annotations.MitsiColumnDisplayTypes;
import org.mitsi.core.annotations.MitsiColumnTitles;
import org.mitsi.core.annotations.MitsiColumnsAsRows;
import org.mitsi.core.annotations.MitsiDatasourceDetail;
import org.mitsi.core.annotations.MitsiTableDetail;
import org.mitsi.datasources.exceptions.MitsiDatasourceException;
import org.mitsi.datasources.exceptions.MitsiSecurityException;
import org.mitsi.datasources.helper.TypeHelper;


public class MitsiConnection implements Closeable, IMitsiMapper {
	private static final Logger log = Logger.getLogger(MitsiConnection.class);

	public static int DEFAULT_FETCH_SIZE = 2000;
	public static int DEFAULT_SQL_TIMEOUT_SEC = 60;
	public static final String MITSI_HIDDEN_RNUM_COLUMN = "mitsi_hiden_rnum__"; 

	private static final Pattern forEachFilterPattern = Pattern.compile("__frch_filter_(\\d+).filter");
	
	SqlSession sqlSession = null; 
	IMitsiMapper mapper = null;
	MitsiDatasource datasource = null;
	
	Class<IMitsiMapper> mapperInterface;
	public enum DETAIL_TYPE { TABLE, DATASOURCE };
	private class DetailMethod {
		public DetailMethod(DETAIL_TYPE type, String title, Method method, int order, String [] columnTitles, ColumnDisplayType[] columnDisplayTypes, String[] columnsAsRowsTitles, String[] columnsAsRowsExclusions) {
			this.type = type;
			this.title = title;
			this.method = method;
			this.order = order;
			this.columnTitles = columnTitles;
			this.columnDisplayTypes = columnDisplayTypes;
			this.columnsAsRowsTitles = columnsAsRowsTitles;
			this.columnsAsRowsExclusions = columnsAsRowsExclusions;

		}
		
		DETAIL_TYPE type;
		String title;
		Method method;
		int order;
		String [] columnTitles;
		ColumnDisplayType [] columnDisplayTypes;
		String[] columnsAsRowsTitles;
		String[] columnsAsRowsExclusions;
		
		boolean isColumnsAsRows() {
			return columnsAsRowsTitles != null;
		}
	}
	List<DetailMethod> tableDetailsMethods;
	List<DetailMethod> datasourceDetailsMethods;
	

	public MitsiConnection(SqlSession sqlSession, IMitsiMapper mapper, MitsiDatasource datasource) {
		this.sqlSession = sqlSession;
		this.mapper = mapper;
		this.datasource = datasource;
		this.tableDetailsMethods = new ArrayList<DetailMethod>();
		this.datasourceDetailsMethods = new ArrayList<DetailMethod>();
		
		// TODO : remplacer par getAnnotatedInterface ?
		@SuppressWarnings("unchecked")
		Class<IMitsiMapper>[] mapperInterfaces = (Class<IMitsiMapper>[]) mapper.getClass().getInterfaces();
		if(mapperInterfaces.length != 1) {
			log.error("mapper has more or less than one interface : "+mapperInterfaces.length);
		}
		mapperInterface = mapperInterfaces[0];
		
		Method[] methods = mapperInterface.getMethods();
		for(Method method : methods) {
			MitsiTableDetail mitsiTableDetail = method.getAnnotation(MitsiTableDetail.class);
			MitsiDatasourceDetail mitsiDatasourceDetail = method.getAnnotation(MitsiDatasourceDetail.class);
			if(mitsiTableDetail == null && mitsiDatasourceDetail == null) {
				continue;
			}
			if(mitsiTableDetail!=null && mitsiDatasourceDetail!=null) {
				log.error("method "+method.getName()+" cannot be annoted by @MitsiDatasourceDetail and @MitsiTableDetail at the same time");
				continue;
			}

			MitsiColumnTitles mitsiColumnTitles = method.getAnnotation(MitsiColumnTitles.class);
			MitsiColumnDisplayTypes mitsiColumnDisplayTypes = method.getAnnotation(MitsiColumnDisplayTypes.class);
			MitsiColumnsAsRows mitsiColumnsAsRows = method.getAnnotation(MitsiColumnsAsRows.class);

			if(mitsiTableDetail != null) {
				tableDetailsMethods.add(new DetailMethod(DETAIL_TYPE.TABLE,
					mitsiTableDetail.value(), 
					method, mitsiTableDetail.order(), 
					mitsiColumnTitles==null?null:mitsiColumnTitles.value(),
					mitsiColumnDisplayTypes==null?null:mitsiColumnDisplayTypes.value(),
					mitsiColumnsAsRows==null?null:mitsiColumnsAsRows.value(),
					mitsiColumnsAsRows==null?null:mitsiColumnsAsRows.excludeColumns()));
			}
			else {
				datasourceDetailsMethods.add(new DetailMethod(DETAIL_TYPE.DATASOURCE,
					mitsiDatasourceDetail.value(), 
					method, mitsiDatasourceDetail.order(), 
					mitsiColumnTitles==null?null:mitsiColumnTitles.value(),
					mitsiColumnDisplayTypes==null?null:mitsiColumnDisplayTypes.value(),
					mitsiColumnsAsRows==null?null:mitsiColumnsAsRows.value(),
					mitsiColumnsAsRows==null?null:mitsiColumnsAsRows.excludeColumns()));
			}
		}
		
		Comparator<DetailMethod> comparator = new Comparator<DetailMethod>() {
			@Override
			public int compare(DetailMethod arg0, DetailMethod arg1) {
				int compareOrder = Integer.compare(arg0.order, arg1.order);
				return compareOrder==0 ?
						arg0.title.compareTo(arg1.title) :
						compareOrder;
			}
		};
		Collections.sort(tableDetailsMethods, comparator);
		Collections.sort(datasourceDetailsMethods, comparator);
	}
	
	@Override
	public void close() {
		sqlSession.rollback();
		sqlSession.close();
	}

	public void rollback() {
		sqlSession.rollback();
	}

	@Override
	public String testOK() {
		return mapper.testOK();
	}
	
	public String getProviderName() {
		return datasource.getProvider();
	}
	
	private String getOwner(String owner) {
		if(owner == null) {
			if(datasource.getConnectSchema() != null) {
				return datasource.getConnectSchema(); //.toUpperCase();
			}

			Class<?>[] interfaces = mapper.getClass().getInterfaces();
			for(Class<?> i : interfaces) {
				DefaultOwner defaultOwner = i.getAnnotation(DefaultOwner.class);
				if(defaultOwner != null) {
					return defaultOwner.value(); //.toUpperCase();
				}
				DefaultOwnerIsConnectedUser defaultOwnerIsConnectedUser = i.getAnnotation(DefaultOwnerIsConnectedUser.class);
				if(defaultOwnerIsConnectedUser != null) {
					return datasource.getUser(); //.toUpperCase();
				}
			}
		}
		return owner; //.toUpperCase();

	}

	@Override
	@SuppressWarnings("squid:S1226") 
	public List<Schema> getAllSchemas(String owner) {
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
	public List<DatabaseObject> getTablesAndViews(String owner) {
		owner = getOwner(owner);
		List<DatabaseObject> databaseObjects = mapper.getTablesAndViews(owner);
		getTablesAndViewsSubObjects(databaseObjects, owner);
		return databaseObjects;
	}
	
	private interface ExecuteRowSqlCallback {
		void onNewColumn(String columnName, String type);
		void onNewRow(String [] row) throws MitsiException;
		void addMessage(String message);
		boolean mustStop();
	}
	
	void executeBoundSql(BoundSql boundSql, Map<String, Object> params, Filter[] filters, ExecuteRowSqlCallback callback) throws SQLException, MitsiException {
		executeRawSql(boundSql.getSql(), boundSql.getParameterMappings(), params, filters, null, null, null, null, callback);
	}

	void executeRawSql(String sqlText, List<ParameterMapping> parameterMappings, Map<String, Object> params, Filter[] filters, Integer timeout, Integer fetchSize, CancellableStatementsManager cancellableStatementsManager, String cancelSqlId, ExecuteRowSqlCallback callback) throws SQLException, MitsiException {
		
		try(PreparedStatement statement = sqlSession.getConnection().prepareStatement(sqlText)) {
			
			statement.setFetchSize(fetchSize == null ? DEFAULT_FETCH_SIZE : fetchSize); 
			int iParam = 0;
			if (parameterMappings != null && params != null) {
				for (ParameterMapping parameterMapping : parameterMappings) {
					iParam++;
					
					// only fromRow, count and filters may be passed as bind variable
					Object obj = params.get(parameterMapping.getProperty());
					if(filters != null && obj == null) {
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
							log.error("unknown parameter : " + parameterMapping.getProperty());
							throw new MitsiException("unknown parameter : " + parameterMapping.getProperty());
						}
					}
					else {
						if(obj instanceof Long) {
							statement.setLong(iParam, (Long) obj);
						}
						else if(obj instanceof String) {
							statement.setString(iParam, (String) obj);
						}
						else {
							log.error("unhandled parameter type : " + obj.getClass().getName());
							throw new MitsiException("unhandled parameter type : " + obj.getClass().getName());
						}
					}
				}
			}
			
			if (cancellableStatementsManager != null) {
				long statementCount = cancellableStatementsManager.getDatasourceStatementsCount(datasource.getName());
				if (datasource.getMaxRunningStatementPerUser() <= statementCount) {
					throw new MitsiException("You have already "+statementCount+" statements running for this datasource. Try again later or cancel them.");
				}
				cancellableStatementsManager.addStatement(datasource.getName(), cancelSqlId, statement);
			}
			
			statement.setQueryTimeout(timeout == null || timeout <= 0 ? DEFAULT_SQL_TIMEOUT_SEC : timeout);
			statement.execute();
			ResultSet resultSet = statement.getResultSet();

			if (resultSet == null) {
				callback.addMessage("statement executed, " + statement.getUpdateCount() + " rows updated"); // TODO : message a revoir, ne convient pas pour un create table ou un delete
			}
			else {
				// get columns
				ResultSetMetaData rsmd = resultSet.getMetaData();
				int[] jdbcTypes = new int[rsmd.getColumnCount()];
				int[] columnPos = new int[rsmd.getColumnCount()];
				int nbColumns = 0;
				for (int i = 1; i < rsmd.getColumnCount() + 1; i++) {
					String columnName = rsmd.getColumnName(i);
					if (MITSI_HIDDEN_RNUM_COLUMN.equals(columnName.toLowerCase())) {
						columnPos[i - 1] = -1;
						continue;
					}
					String type = TypeHelper.getTypeFromJdbc(rsmd.getColumnType(i));
					callback.onNewColumn(columnName, type);

					jdbcTypes[i - 1] = rsmd.getColumnType(i);
					columnPos[i - 1] = nbColumns;
					nbColumns++;
				}

				// get data

				while (resultSet.next()) {
					String[] row = new String[nbColumns];
					for (int i = 0; i != row.length; i++) {
						if (columnPos[i] >= 0) {
							//if(jdbcTypes[i]!=-1) {
							row[columnPos[i]] = TypeHelper.fromJdbcToString(jdbcTypes[i], resultSet, i + 1);
							//}
						}
					}
					callback.onNewRow(row);
					if (callback.mustStop()) {
						break;
					}
				}
			}
		}
		finally {
			if (cancellableStatementsManager != null && cancelSqlId != null) {
				cancellableStatementsManager.removeStatement(datasource.getName(), cancelSqlId);
			}
		}
	}
	
	public DetailsSection getDetailsOne(Map<String, Object> params, final DetailMethod detailMethod) throws SQLException, MitsiException {
		final DetailsSection detailsSection = new DetailsSection();
		detailsSection.title = detailMethod.title;
		detailsSection.columns = new ArrayList<>();
		detailsSection.data = new ArrayList<>();

		MappedStatement ms = sqlSession.getConfiguration()
				.getMappedStatement(mapperInterface.getName() + "." + detailMethod.method.getName());
		BoundSql boundSql = ms.getBoundSql(params);
		
		if(detailMethod.isColumnsAsRows()) {
			String parameterColumnTitle = "Parameter";
			String valueColumnTitle = "Value";
			if(detailMethod.columnsAsRowsTitles!=null) {
				if(detailMethod.columnsAsRowsTitles.length>=1) {
					parameterColumnTitle = detailMethod.columnsAsRowsTitles[0];
				}
				if(detailMethod.columnsAsRowsTitles.length>=2) {
					valueColumnTitle = detailMethod.columnsAsRowsTitles[1];
				}
			}
			detailsSection.columns.add(detailsSection.new Column(parameterColumnTitle, null)); 
			detailsSection.columns.add(detailsSection.new Column(valueColumnTitle, null)); 
			
			executeBoundSql(boundSql, params, null, new ExecuteRowSqlCallback() {
				boolean firstRow = true;
				
				List<String> columnsNames = new ArrayList<>();
				List<String> hiddenColumnsList = Arrays.asList(detailMethod.columnsAsRowsExclusions==null ? new String[0] : detailMethod.columnsAsRowsExclusions);
				
				@Override
				public void onNewColumn(String columnName, String type) {
					if(hiddenColumnsList.contains(columnName)) {
						columnsNames.add(null);
					}
					else {
						columnsNames.add(columnName);
					}
				}
	
				@Override
				public void onNewRow(String[] row) throws MitsiException {
					if(!firstRow) {
						throw new MitsiException("impossible to display columns as rows for "+detailMethod.title+" because there are many rows");
					}
					firstRow = false;
					
					for(int i=0; i!=row.length; i++) {
						String columnName = columnsNames.get(i);
						if(columnName != null) {
							String[] columnRow = new String[2];
							columnRow[0] = columnName;
							columnRow[1] = row[i];
							detailsSection.data.add(columnRow);
						}
					}
				}

				@Override
				public void addMessage(String message) {
					// nothing
				}

				@Override
				public boolean mustStop() {
					return false;
				}
			});
		}
		else {
			executeBoundSql(boundSql, params, null, new ExecuteRowSqlCallback() {
	
				@Override
				public void onNewColumn(String columnName, String type) {
					String annotationColumnName = null;
					if(detailMethod.columnTitles!=null && detailMethod.columnTitles.length > detailsSection.columns.size()) {
						annotationColumnName = detailMethod.columnTitles[detailsSection.columns.size()];
						if(annotationColumnName != null && annotationColumnName.length()==0) {
							annotationColumnName = null;
						}
					}
					
					String displayType = null;
					if(detailMethod.columnDisplayTypes!=null && detailMethod.columnDisplayTypes.length > detailsSection.columns.size()) {
						 ColumnDisplayType columnDisplayType = detailMethod.columnDisplayTypes[detailsSection.columns.size()];
						 displayType = columnDisplayType.toString();
					}
					
					detailsSection.columns.add(detailsSection.new Column(annotationColumnName==null ? columnName : annotationColumnName, displayType));				
				}
	
				@Override
				public void onNewRow(String[] row) {
					detailsSection.data.add(row);
				}

				@Override
				public void addMessage(String message) {
					// nothing
				}

				@Override
				public boolean mustStop() {
					return false;
				}
			});
		}
		
		return detailsSection;
	}
	
	public List<DetailsSection> getDetails(Map<String, Object> params, List<DetailMethod> detailMethods) throws MitsiException, SQLException {
		List<DetailsSection> detailsSections = new ArrayList<DetailsSection>();

		for(DetailMethod detailMethod : detailMethods) {
			DetailsSection detailsSection = getDetailsOne(params, detailMethod);
			detailsSections.add(detailsSection);
		}

		return detailsSections;
	}

	
	public List<DetailsSection> getDetailsForTable(String owner, String name) throws MitsiException {
		try {
			owner = getOwner(owner);
			Map<String, Object> params = new HashMap<>();
			params.put("owner", owner);    
			params.put("tableName", name);    
			
			return getDetails(params, tableDetailsMethods);
		}
		catch(SQLException e) {
			log.error("error in getDetailsForTable", e);
			throw new MitsiDatasourceException("error in getDetailsForTable", e);
		}
	}
	
	public List<DetailsSection> getDetailsForDatasource() throws MitsiException {
		try {
			Map<String, Object> params = new HashMap<>();
			
			return getDetails(params, datasourceDetailsMethods);
		}
		catch(SQLException e) {
			log.error("error in getDetailsForDatasource", e);
			throw new MitsiDatasourceException("error in getDetailsForDatasource", e);
		}
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
		public List<String> messages;
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
		
		final GetDataResult result = new GetDataResult();
		result.columns = new ArrayList<>();
		result.results = new ArrayList<>();

		MappedStatement ms = sqlSession.getConfiguration()
				.getMappedStatement(mapperInterface.getName() + ".getData");
		Map<String, Object> params = new HashMap<>();
		params.put("owner", owner);    
		params.put("tableName", tableName);    
		params.put("fromRow", fromRow);
		params.put("count", count);
		params.put("orderByColumns", orderByColumns);
		params.put("filters", filters);
		BoundSql boundSql = ms.getBoundSql(params);
		
		executeBoundSql(boundSql, params, filters, new ExecuteRowSqlCallback() {

			@Override
			public void onNewColumn(String columnName, String type) {
				// TODO : DisplayType => faire une annotation
				Column column = new Column();
				column.type = type;
				column.name = columnName;
				result.columns.add(column);				
			}

			@Override
			public void onNewRow(String[] row) {
				result.results.add(row);
			}

			@Override
			public void addMessage(String message) {
				result.messages.add(message);
			}

			@Override
			public boolean mustStop() {
				return false;
			}
		});
		
		return result;
	}
	
	public GetDataResult runSql(String sqlText, Integer timeout, final Integer maxRows, CancellableStatementsManager cancellableStatementsManager, String cancelSqlId) throws SQLException, MitsiException {
		// TODO : bind variables
		final GetDataResult result = new GetDataResult();
		result.columns = new ArrayList<>();
		result.results = new ArrayList<>();
		result.messages = new ArrayList<>();

		try {
			executeRawSql(sqlText, null, null, null, timeout, maxRows, cancellableStatementsManager, cancelSqlId, new ExecuteRowSqlCallback() {
				int rowCount = 0;
				
				@Override
				public void onNewColumn(String columnName, String type) {
					Column column = new Column();
					column.type = type;
					column.name = columnName;
					result.columns.add(column);				
				}
	
				@Override
				public void onNewRow(String[] row) {
					result.results.add(row);
					rowCount++;
				}

				@Override
				public void addMessage(String message) {
					result.messages.add(message);
				}

				@Override
				public boolean mustStop() {
					return maxRows!=null && rowCount >= maxRows;
				}
			});
			
			return result;
		}
		catch (SQLException e) {
			throw new MitsiException(e.getMessage(), e);
		}
	}
	
	public void cancelAllRunningSql(CancellableStatementsManager cancellableStatementsManager) throws SQLException {
		cancellableStatementsManager.cancelAllForDatasource(datasource.getName());
	}
	
	public void cancelRunningSql(CancellableStatementsManager cancellableStatementsManager, String cancelSqlId) throws SQLException {
		cancellableStatementsManager.cancel(datasource.getName(), cancelSqlId);
	}
	
	public long getMaxExportRows() {
		return datasource.getMaxExportRows();
	}
	
}
