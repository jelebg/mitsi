package org.mitsi.mitsiwar.details;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

import org.apache.log4j.Logger;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.Partition;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Tablespace;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

class GetDetails {
	String datasourceName;
	String objectType;
	String objectName;
	String owner;
	
	public GetDetails() {
	}
}

class GetDetailsResponse {
	public class Accordion {
		String message;
		String title;
		List<String> columns;
		List<String[]> data;
		List<DatabaseObject> databaseObjects;
		List<Schema> schemas;
		List<Tablespace> tablespaces;
		String[] links;
	}

	String message;
	List<Accordion> accordions;
	
	public GetDetailsResponse() {}
}

public class GetDetailsServlet extends GsonServlet<GetDetails, GetDetailsResponse> {
	private static final Logger log = Logger.getLogger(GetDetailsServlet.class);
	private static final long serialVersionUID = 1L;

	@Autowired
	private DatasourceManager datasourceManager;
	
	public GetDetailsServlet() {
        super(GetDetails.class);
    }
	
	
	//// datasource details

	private void fromObjectList(List<DatabaseObject> objectList, List<String[]> data, List<String> columns) {
		columns.add("owner");
		columns.add("name");
		columns.add("type");
		columns.add("jsonDetails");
		
		for(DatabaseObject object : objectList) {
			String[] row = new String[columns.size()];
			row[0] =  object.getId().getSchema();
			row[1] =  object.getId().getName();
			row[2] =  object.getId().getType();
			row[3] =  object.getJsonDetails();
			data.add(row);
		}
	}
	
	private void fromSchemaList(List<Schema> schemaList, List<String[]> data, List<String> columns) {
		columns.add("name");
		columns.add("current");
		columns.add("jsonDetails");
		
		for(Schema schema : schemaList) {
			String[] row = new String[columns.size()];
			row[0] =  schema.name;
			row[1] =  schema.current?"1":"0";
			row[2] =  schema.jsonDetails;
			data.add(row);
		}
	}
	
	private void fromTablespaceList(List<Tablespace> tablespaceList, List<String[]> data, List<String> columns) {
		columns.add("name");
		columns.add("status");
		columns.add("contents");
		columns.add("jsonDetails");
		
		for(Tablespace tablespace : tablespaceList) {
			String[] row = new String[columns.size()];
			row[0] =  tablespace.name;
			row[1] =  tablespace.status;
			row[2] =  tablespace.contents;
			row[3] =  tablespace.jsonDetails;
			data.add(row);
		}
	}
	
	private String getDetailUrl(String datasourceName, String type, String name, String owner) {
		return "details?datasource="+datasourceName+"&type="+type+"&name="+name+"&owner="+owner;
	}
	
	private String[] getObjectLinks(List<DatabaseObject> objectList, String datasourceName, String type) {
		String[] links = new String[objectList.size()];
		int i =0;
		for(DatabaseObject object : objectList) {
			links[i] = 	getDetailUrl(datasourceName, type, object.getName(), object.getSchema());
			i++;
		}
		return links;
	}

	private String[] getConstraintLinks(List<Constraint> constraintList, String datasourceName) {
		String[] links = new String[constraintList.size()];
		int i =0;
		for(Constraint constraint : constraintList) {
			if(!"R".equals(constraint.type)) {
				continue;
			}
			links[i] = 	getDetailUrl(datasourceName, "table", constraint.fkTable, constraint.fkConstraintOwner);
			i++;
		}
		return links;
	}

	
	private void getDatasource(GetDetailsResponse response, MitsiConnection connection, String datasourceName) {
		response.accordions = new ArrayList<GetDetailsResponse.Accordion>();
		
		GetDetailsResponse.Accordion tables = response.new Accordion();
		response.accordions.add(tables);
		tables.title = "Tables";
		try {
			List<DatabaseObject> objectList = connection.getTablesDetails();
			tables.data = new ArrayList<String[]>();
			tables.columns = new ArrayList<String>();
			fromObjectList(objectList,  tables.data, tables.columns);
			tables.links = getObjectLinks(objectList, datasourceName, "table");
		}
		catch(Exception e) {
			tables.message = e.getMessage();
		}
		
		GetDetailsResponse.Accordion views = response.new Accordion();
		response.accordions.add(views);
		views.title = "Views";
		try {
			List<DatabaseObject> objectList = connection.getViewsDetails();
			views.data = new ArrayList<String[]>();
			views.columns = new ArrayList<String>();
			fromObjectList(objectList,  views.data, views.columns);
			views.links = getObjectLinks(objectList, datasourceName, "view");
		}
		catch(Exception e) {
			views.message = e.getMessage();
		}

		GetDetailsResponse.Accordion matviews = response.new Accordion();
		response.accordions.add(matviews);
		matviews.title = "Materialized Views";
		try {
			List<DatabaseObject> objectList = connection.getMatViewsDetails();
			matviews.data = new ArrayList<String[]>();
			matviews.columns = new ArrayList<String>();
			fromObjectList(objectList,  matviews.data, matviews.columns);
			matviews.links = getObjectLinks(objectList, datasourceName, "matview");
		}
		catch(Exception e) {
			matviews.message = e.getMessage();
		}

		GetDetailsResponse.Accordion schemas = response.new Accordion();
		response.accordions.add(schemas);
		schemas.title = "Users / schemas";
		try {
			List<Schema> schemaList = connection.getSchemasDetails();
			schemas.data = new ArrayList<String[]>();
			schemas.columns = new ArrayList<String>();
			fromSchemaList(schemaList,  schemas.data, schemas.columns);
		}
		catch(Exception e) {
			schemas.message = e.getMessage();
		}

		GetDetailsResponse.Accordion tablespaces = response.new Accordion();
		response.accordions.add(tablespaces);
		tablespaces.title = "Tablespaces";
		try {
			List<Tablespace> tablespaceList = connection.getTablespaceDetails();
			tablespaces.data = new ArrayList<String[]>();
			tablespaces.columns = new ArrayList<String>();
			fromTablespaceList(tablespaceList,  tablespaces.data, tablespaces.columns);
		}
		catch(Exception e) {
			// TODO : afficher l'erreur à l'utilisateur
			tablespaces.message = e.getMessage();
		}

	}
	
	

	//// table details

	
	private void fromColumnsList(List<Column> columnList, List<String[]> data, List<String> columns) {
		columns.add("name");
		columns.add("type");
		columns.add("length");
		columns.add("precision");
		columns.add("scale");
		columns.add("defaultValue");
		columns.add("nullable");
		columns.add("jsonDetails");
		
		for(Column dbColumn : columnList) {
			String[] row = new String[columns.size()];
			row[0] =  dbColumn.name;
			row[1] =  dbColumn.type;
			row[2] =  Long.toString(dbColumn.length);
			row[3] =  dbColumn.precision;
			row[4] =  dbColumn.scale;
			row[5] =  dbColumn.defaultValue;
			row[6] =  dbColumn.nullable;
			row[7] =  dbColumn.jsonDetails;
			data.add(row);
		}
	}
	
	private void fromPartitioningKeyList(List<Column> columnList, List<String[]> data, List<String> columns) {
		columns.add("name");
		
		for(Column dbColumn : columnList) {
			String[] row = new String[columns.size()];
			row[0] =  dbColumn.name;
			data.add(row);
		}
	}
	
	private void fromIndexList(List<Index> indexList, List<String[]> data, List<String> columns) {
		columns.add("owner");
		columns.add("name");
		columns.add("type");
		columns.add("uniqueness");
		columns.add("columns");
		columns.add("tablespace");
		columns.add("partitioning");
		columns.add("jsonDetails");
		
		for(Index index : indexList) {
			String[] row = new String[columns.size()];
			row[0] =  index.owner;
			row[1] =  index.name;
			row[2] =  index.type;
			row[3] =  index.uniqueness;
			row[4] =  index.columns;
			row[5] =  index.tablespace;
			row[6] =  index.partitioning;
			row[7] =  index.jsonDetails;
			data.add(row);
		}
	}

	private void fromPartitionList(List<Partition> partitionList, List<String[]> data, List<String> columns) {
		columns.add("name");
		columns.add("tablespace name");
		columns.add("high value");
		columns.add("high value length");
		columns.add("interval");
		columns.add("jsonDetails");
		
		for(Partition partition : partitionList) {
			String[] row = new String[columns.size()];
			row[0] =  partition.name;
			row[1] =  partition.tablespaceName;
			row[2] =  partition.highValue;
			row[3] =  Long.toString(partition.highValueLength);
			row[4] =  partition.interval;
			row[5] =  partition.jsonDetails;
			data.add(row);
		}
	}
	
	private void fromConstraintList(List<Constraint> constraintList, List<String[]> data, List<String> columns) {
		columns.add("name");
		columns.add("type");
		columns.add("columns");
		columns.add("FK constraint owner");
		columns.add("FK constraint name");
		columns.add("FK table");
		columns.add("FK columns");
		columns.add("jsonDetails");
		
		for(Constraint constraint : constraintList) {
			String[] row = new String[columns.size()];
			row[0] =  constraint.name;
			row[1] =  constraint.type;
			row[2] =  constraint.columns;
			row[3] =  constraint.fkConstraintOwner;
			row[4] =  constraint.fkConstraintName;
			row[5] =  constraint.fkTable;
			row[6] =  constraint.fkColumns;
			row[7] =  constraint.jsonDetails;
			data.add(row);
		}
	}
	
	private void fromFktoList(List<Constraint> constraintList, List<String[]> data, List<String> columns) {
		columns.add("name");
		columns.add("columns");
		columns.add("FK constraint owner");
		columns.add("FK constraint name");
		columns.add("FK table");
		columns.add("FK columns");
		
		for(Constraint constraint : constraintList) {
			String[] row = new String[columns.size()];
			row[0] =  constraint.name;
			row[1] =  constraint.columns;
			row[2] =  constraint.fkConstraintOwner;
			row[3] =  constraint.fkConstraintName;
			row[4] =  constraint.fkTable;
			row[5] =  constraint.fkColumns;
			data.add(row);
		}
	}

	private void getTable(GetDetailsResponse response, MitsiConnection connection,
			String datasourceName, String owner, String tableName) {
		response.accordions = new ArrayList<GetDetailsResponse.Accordion>();
		
		//response.message = "details for table "+owner+"."+tableName;
		
		// columns
		GetDetailsResponse.Accordion columns = response.new Accordion();
		response.accordions.add(columns);
		columns.title = "Columns";
		try {
			List<Column> columnList = connection.getTableColumnsDetails(owner, tableName);
			columns.data = new ArrayList<String[]>();
			columns.columns = new ArrayList<String>();
			fromColumnsList(columnList,  columns.data, columns.columns);
		}
		catch(Exception e) {
			columns.message = e.getMessage();
		}
		
		// indexes
		GetDetailsResponse.Accordion indexes = response.new Accordion();
		response.accordions.add(indexes);
		indexes.title = "Indexes";
		try {
			List<Index> indexList = connection.getTableIndexesDetails(owner, tableName);
			indexes.data = new ArrayList<String[]>();
			indexes.columns = new ArrayList<String>();
			fromIndexList(indexList,  indexes.data, indexes.columns);
		}
		catch(Exception e) {
			indexes.message = e.getMessage();
		}
		
		// constraints
		GetDetailsResponse.Accordion constraints = response.new Accordion();
		response.accordions.add(constraints);
		constraints.title = "Constraints";
		try {
			List<Constraint> constraintList = connection.getTableConstraintsDetails(owner, tableName);
			constraints.data = new ArrayList<String[]>();
			constraints.columns = new ArrayList<String>();
			fromConstraintList(constraintList,  constraints.data, constraints.columns);
			constraints.links = getConstraintLinks(constraintList, datasourceName);

		}
		catch(Exception e) {
			constraints.message = e.getMessage();
		}
		
		// FKs to this table
		GetDetailsResponse.Accordion fkto = response.new Accordion();
		response.accordions.add(fkto);
		fkto.title = "FK to this table";
		try {
			List<Constraint> fktoList = connection.getTablesWithConstraintsTo(owner, tableName);
			fkto.data = new ArrayList<String[]>();
			fkto.columns = new ArrayList<String>();
			fromFktoList(fktoList,  fkto.data, fkto.columns);
			fkto.links = getConstraintLinks(fktoList, datasourceName);

		}
		catch(Exception e) {
			constraints.message = e.getMessage();
		}

		// partitioning keys
		GetDetailsResponse.Accordion partitioningKeys = response.new Accordion();
		response.accordions.add(partitioningKeys);
		partitioningKeys.title = "Partitioning keys";
		try {
			List<Column> partitioningKeysList = connection.getTablePartitioninKeysDetails(owner, tableName);
			partitioningKeys.data = new ArrayList<String[]>();
			partitioningKeys.columns = new ArrayList<String>();
			fromPartitioningKeyList(partitioningKeysList,  partitioningKeys.data, partitioningKeys.columns);
		}
		catch(Exception e) {
			columns.message = e.getMessage();
		}

		// partitions
		GetDetailsResponse.Accordion partitions = response.new Accordion();
		response.accordions.add(partitions);
		partitions.title = "Partitions";
		try {
			List<Partition> partitionList = connection.getTablePartitionDetails(owner, tableName);
			partitions.data = new ArrayList<String[]>();
			partitions.columns = new ArrayList<String>();
			fromPartitionList(partitionList,  partitions.data, partitions.columns);
		}
		catch(Exception e) {
			partitions.message = e.getMessage();
		}
		
		
	}
	
 
	@Override
	public GetDetailsResponse proceed(GetDetails request, Client connectedClient) throws Exception {
		
		GetDetailsResponse response = new GetDetailsResponse();
		
		String connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);

		try (MitsiConnection connection = datasourceManager.getConnection(groups, connectedUsername!=null, request.datasourceName)) { 
			if(StringUtils.isEmpty(request.objectName) || StringUtils.isEmpty(request.objectType) || StringUtils.isEmpty(request.owner)) {
				getDatasource(response, connection, request.datasourceName);
			}
			else {
				
				if("table".equals(request.objectType)) {
					getTable(response, connection, request.datasourceName, request.owner, request.objectName);
				}
				else {
					log.error("unknown object type : "+request.objectType);
				}
			}
		}
		
		
		return response;
	}




}
