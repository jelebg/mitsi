package org.mitsi.mitsiwar.details;

import java.util.ArrayList;
import java.util.List;
import java.util.SortedSet;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.Partition;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Sequence;
import org.mitsi.datasources.Tablespace;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.users.MitsiUsersException;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

class GetDetails {
	String datasourceName;
	String objectType;
	String objectName;
	String owner;
	
	public GetDetails() {
		// nothing
	}
}

class GetDetailsResponse {
	public class Accordion {
		String message;
		String title;
		List<String> columns;
		List<String[]> data;
		String[] links;
	}

	String message;
	List<Accordion> accordions;
	
	public GetDetailsResponse() {
		// nothing
	}
}

@Controller
@RequestMapping("/getDetails")
public class GetDetailsController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(GetDetailsController.class);

	
	
	//// datasource details

	private void fromObjectList(List<DatabaseObject> objectList, GetDetailsResponse.Accordion accordion, String title) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = title;
			accordion.columns.add("owner");
			accordion.columns.add("name");
			accordion.columns.add("type");
			accordion.columns.add("jsonDetails");
		
			for(DatabaseObject object : objectList) {
				accordion.data.add(new String[] {
						object.getId().getSchema(),
						object.getId().getName(),
						object.getId().getType(),
						object.getJsonDetails()
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}
	
	private void fromSequence(List<Sequence> sequencesList, GetDetailsResponse.Accordion accordion, String title) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = title;
			accordion.columns.add("owner");
			accordion.columns.add("name");
			accordion.columns.add("minValue");
			accordion.columns.add("maxValue");
			accordion.columns.add("currentValue");
			accordion.columns.add("incrementBy");
			accordion.columns.add("jsonDetails");
		
			for(Sequence sequence : sequencesList) {
				accordion.data.add(new String[] {
						sequence.owner,
						sequence.name,
						Long.toString(sequence.minValue),
						sequence.maxValue,
						sequence.currentValue,
						Long.toString(sequence.incrementBy),
						sequence.jsonDetails
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}
	
	private void fromSchemaList(List<Schema> schemaList, GetDetailsResponse.Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Users / schemas";
			accordion.columns.add("name");
			accordion.columns.add("current");
			accordion.columns.add("jsonDetails");
			
			for(Schema schema : schemaList) {
				accordion.data.add(new String[] {
					schema.name,
					schema.current?"1":"0",
					schema.jsonDetails
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}
	
	private void fromTablespaceList(List<Tablespace> tablespaceList, GetDetailsResponse.Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Tablespaces";
			accordion.columns.add("name");
			accordion.columns.add("status");
			accordion.columns.add("contents");
			accordion.columns.add("jsonDetails");
			
			for(Tablespace tablespace : tablespaceList) {
				accordion.data.add(new String[] {
					tablespace.name,
					tablespace.status,
					tablespace.contents,
					tablespace.jsonDetails
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
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

	@SuppressWarnings("squid:S1166")
	private void getDatasource(GetDetailsResponse response, MitsiConnection connection, String datasourceName) {
		response.accordions = new ArrayList<>();
		
		GetDetailsResponse.Accordion tables      = response.new Accordion();
		GetDetailsResponse.Accordion views       = response.new Accordion();
		GetDetailsResponse.Accordion matviews    = response.new Accordion();
		GetDetailsResponse.Accordion sequences   = response.new Accordion();
		GetDetailsResponse.Accordion schemas     = response.new Accordion();
		GetDetailsResponse.Accordion tablespaces = response.new Accordion();

		response.accordions.add(tables);
		response.accordions.add(views);
		response.accordions.add(matviews);
		response.accordions.add(sequences);
		response.accordions.add(schemas);
		response.accordions.add(tablespaces);

		List<DatabaseObject> objectList = connection.getTablesDetails();
		fromObjectList(objectList,  tables, "Tables");
		tables.links = getObjectLinks(objectList, datasourceName, "table");
		
		List<DatabaseObject> objectListViews = connection.getViewsDetails();
		fromObjectList(objectListViews,  views, "Views");
		views.links = getObjectLinks(objectListViews, datasourceName, "view");

		List<DatabaseObject> objectListMatViews = connection.getMatViewsDetails();
		fromObjectList(objectListMatViews,  matviews, "Materialized Views");
		matviews.links = getObjectLinks(objectListMatViews, datasourceName, "matview");

		List<Sequence> sequencesList = connection.getSequencesDetails();
		fromSequence(sequencesList,  sequences, "Sequences");

		List<Schema> schemaList = connection.getSchemasDetails();
		fromSchemaList(schemaList,  schemas);

		List<Tablespace> tablespaceList = connection.getTablespaceDetails();
		fromTablespaceList(tablespaceList,  tablespaces);
	}
	
	

	//// table details

	
	private void fromColumnsList(List<Column> columnList, GetDetailsResponse.Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Columns";
			accordion.columns.add("name");
			accordion.columns.add("type");
			accordion.columns.add("length");
			accordion.columns.add("precision");
			accordion.columns.add("scale");
			accordion.columns.add("defaultValue");
			accordion.columns.add("nullable");
			accordion.columns.add("jsonDetails");
			
			for(Column dbColumn : columnList) {
				accordion.data.add(new String[] {
					dbColumn.name,
					dbColumn.type,
					Long.toString(dbColumn.length),
					dbColumn.precision,
					dbColumn.scale,
					dbColumn.defaultValue,
					dbColumn.nullable,
					dbColumn.jsonDetails
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}
	
	private void fromPartitioningKeyList(List<Column> columnList, GetDetailsResponse.Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Partitioning keys";
			accordion.columns.add("name");
			
			for(Column dbColumn : columnList) {
				accordion.data.add(new String[] {
					dbColumn.name
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}
	
	private void fromIndexList(List<Index> indexList, GetDetailsResponse.Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Indexes";
			accordion.columns.add("owner");
			accordion.columns.add("name");
			accordion.columns.add("type");
			accordion.columns.add("uniqueness");
			accordion.columns.add("columns");
			accordion.columns.add("tablespace");
			accordion.columns.add("partitioning");
			accordion.columns.add("jsonDetails");

			for(Index index : indexList) {
				accordion.data.add(new String[] {
					index.owner,
					index.name,
					index.type,
					index.uniqueness,
					index.columns,
					index.tablespace,
					index.partitioning,
					index.jsonDetails
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}

	private void fromPartitionList(List<Partition> partitionList, GetDetailsResponse.Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Partitions";
			accordion.columns.add("name");
			accordion.columns.add("tablespace name");
			accordion.columns.add("high value");
			accordion.columns.add("high value length");
			accordion.columns.add("interval");
			accordion.columns.add("jsonDetails");
			
			for(Partition partition : partitionList) {
				accordion.data.add(new String[] {
					partition.name,
					partition.tablespaceName,
					partition.highValue,
					Long.toString(partition.highValueLength),
					partition.interval,
					partition.jsonDetails
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}
	
	private void fromConstraintList(List<Constraint> constraintList, GetDetailsResponse.Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Constraints";
			accordion.columns.add("name");
			accordion.columns.add("type");
			accordion.columns.add("columns");
			accordion.columns.add("FK constraint owner");
			accordion.columns.add("FK constraint name");
			accordion.columns.add("FK table");
			accordion.columns.add("FK columns");
			accordion.columns.add("jsonDetails");
			
			for(Constraint constraint : constraintList) {
				accordion.data.add(new String[] {
					constraint.name,
					constraint.type,
					constraint.columns,
					constraint.fkConstraintOwner,
					constraint.fkConstraintName,
					constraint.fkTable,
					constraint.fkColumns,
					constraint.jsonDetails
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}
	
	private void fromFktoList(List<Constraint> constraintList, GetDetailsResponse.Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "FK to this table";
			accordion.columns.add("name");
			accordion.columns.add("columns");
			accordion.columns.add("FK constraint owner");
			accordion.columns.add("FK constraint name");
			accordion.columns.add("FK table");
			accordion.columns.add("FK columns");
			
			for(Constraint constraint : constraintList) {
				accordion.data.add(new String[] {
					constraint.name,
					constraint.columns,
					constraint.fkConstraintOwner,
					constraint.fkConstraintName,
					constraint.fkTable,
					constraint.fkColumns
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}

	@SuppressWarnings("squid:S1166")
	private void getTable(GetDetailsResponse response, MitsiConnection connection,
			String datasourceName, String owner, String tableName) {
		response.accordions = new ArrayList<>();
		
		GetDetailsResponse.Accordion columns = response.new Accordion();
		GetDetailsResponse.Accordion indexes = response.new Accordion();
		GetDetailsResponse.Accordion constraints = response.new Accordion();
		GetDetailsResponse.Accordion fkto = response.new Accordion();
		GetDetailsResponse.Accordion partitioningKeys = response.new Accordion();
		GetDetailsResponse.Accordion partitions = response.new Accordion();

		response.accordions.add(columns);
		response.accordions.add(indexes);
		response.accordions.add(constraints);
		response.accordions.add(fkto);
		response.accordions.add(partitioningKeys);
		response.accordions.add(partitions);
		
		List<Column> columnList = connection.getTableColumnsDetails(owner, tableName);
		fromColumnsList(columnList,  columns);
		
		List<Index> indexList = connection.getTableIndexesDetails(owner, tableName);
		fromIndexList(indexList,  indexes);
		
		List<Constraint> constraintList = connection.getTableConstraintsDetails(owner, tableName);
		fromConstraintList(constraintList,  constraints);
		constraints.links = getConstraintLinks(constraintList, datasourceName);
		
		List<Constraint> fktoList = connection.getTablesWithConstraintsTo(owner, tableName);
		fromFktoList(fktoList,  fkto);
		fkto.links = getConstraintLinks(fktoList, datasourceName);

		List<Column> partitioningKeysList = connection.getTablePartitioninKeysDetails(owner, tableName);
		fromPartitioningKeyList(partitioningKeysList,  partitioningKeys);

		List<Partition> partitionList = connection.getTablePartitionDetails(owner, tableName);
		fromPartitionList(partitionList,  partitions);
		
	}
	
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody GetDetailsResponse proceed(@RequestBody GetDetails request, HttpSession httpSession) throws MitsiUsersException {
		GetDetailsResponse response = new GetDetailsResponse();
		
		try (MitsiConnection connection = getConnection(httpSession, request.datasourceName)) { // 
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
