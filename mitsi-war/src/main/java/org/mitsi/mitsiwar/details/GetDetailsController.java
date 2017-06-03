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

class AccordionColumn {
	public AccordionColumn(String name, String displayType) {
		this.name = name;
		this.displayType = displayType;
	}
	String name;
	String displayType;
}

class Accordion {
	String message;
	String title;
	List<AccordionColumn> columns;
	List<String[]> data;
}

class GetDetailsResponse {

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

	private void fromObjectList(List<DatabaseObject> objectList, Accordion accordion, String title) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = title;
			accordion.columns.add(new AccordionColumn("name", "tableLink"));
			accordion.columns.add(new AccordionColumn("type", null));
			accordion.columns.add(new AccordionColumn("jsonDetails", null));
		
			for(DatabaseObject object : objectList) {
				accordion.data.add(new String[] {
						object.getId().getSchema()+"."+object.getId().getName(),
						object.getId().getType(),
						object.getJsonDetails()
				});
			}
		}
		catch(Exception e) {
			accordion.message = e.getMessage();
		}
	}
	
	private void fromSequence(List<Sequence> sequencesList, Accordion accordion, String title) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = title;
			accordion.columns.add(new AccordionColumn("owner", null));
			accordion.columns.add(new AccordionColumn("name", null));
			accordion.columns.add(new AccordionColumn("minValue", null));
			accordion.columns.add(new AccordionColumn("maxValue", null));
			accordion.columns.add(new AccordionColumn("currentValue", null));
			accordion.columns.add(new AccordionColumn("incrementBy", null));
			accordion.columns.add(new AccordionColumn("jsonDetails", null));
		
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
	
	private void fromSchemaList(List<Schema> schemaList, Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Users / schemas";
			accordion.columns.add(new AccordionColumn("name", null));
			accordion.columns.add(new AccordionColumn("current", null));
			accordion.columns.add(new AccordionColumn("jsonDetails", null));
			
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
	
	private void fromTablespaceList(List<Tablespace> tablespaceList, Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Tablespaces";
			accordion.columns.add(new AccordionColumn("name", null));
			accordion.columns.add(new AccordionColumn("status", null));
			accordion.columns.add(new AccordionColumn("contents", null));
			accordion.columns.add(new AccordionColumn("jsonDetails", null));
			
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
	
	@SuppressWarnings("squid:S1166")
	private void getDatasource(GetDetailsResponse response, MitsiConnection connection, String datasourceName) {
		response.accordions = new ArrayList<>();
		
		Accordion tables      = new Accordion();
		Accordion views       = new Accordion();
		Accordion matviews    = new Accordion();
		Accordion sequences   = new Accordion();
		Accordion schemas     = new Accordion();
		Accordion tablespaces = new Accordion();

		response.accordions.add(tables);
		response.accordions.add(views);
		response.accordions.add(matviews);
		response.accordions.add(sequences);
		response.accordions.add(schemas);
		response.accordions.add(tablespaces);

		List<DatabaseObject> objectList = connection.getTablesDetails();
		fromObjectList(objectList,  tables, "Tables");
		
		List<DatabaseObject> objectListViews = connection.getViewsDetails();
		fromObjectList(objectListViews,  views, "Views");

		List<DatabaseObject> objectListMatViews = connection.getMatViewsDetails();
		fromObjectList(objectListMatViews,  matviews, "Materialized Views");

		List<Sequence> sequencesList = connection.getSequencesDetails();
		fromSequence(sequencesList,  sequences, "Sequences");

		List<Schema> schemaList = connection.getSchemasDetails();
		fromSchemaList(schemaList,  schemas);

		List<Tablespace> tablespaceList = connection.getTablespaceDetails();
		fromTablespaceList(tablespaceList,  tablespaces);
	}
	
	

	//// table details

	
	private void fromColumnsList(List<Column> columnList, Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Columns";
			accordion.columns.add(new AccordionColumn("name", null));
			accordion.columns.add(new AccordionColumn("type", null));
			accordion.columns.add(new AccordionColumn("length", null));
			accordion.columns.add(new AccordionColumn("precision", null));
			accordion.columns.add(new AccordionColumn("scale", null));
			accordion.columns.add(new AccordionColumn("defaultValue", null));
			accordion.columns.add(new AccordionColumn("nullable", null));
			accordion.columns.add(new AccordionColumn("jsonDetails", null));
			
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
	
	private void fromPartitioningKeyList(List<Column> columnList, Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Partitioning keys";
			accordion.columns.add(new AccordionColumn("name", null));
			
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
	
	private void fromIndexList(List<Index> indexList, Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Indexes";
			accordion.columns.add(new AccordionColumn("owner", null));
			accordion.columns.add(new AccordionColumn("name", null));
			accordion.columns.add(new AccordionColumn("type", null));
			accordion.columns.add(new AccordionColumn("uniqueness", null));
			accordion.columns.add(new AccordionColumn("columns", null));
			accordion.columns.add(new AccordionColumn("tablespace", null));
			accordion.columns.add(new AccordionColumn("partitioning", null));
			accordion.columns.add(new AccordionColumn("jsonDetails", null));

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

	private void fromPartitionList(List<Partition> partitionList, Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Partitions";
			accordion.columns.add(new AccordionColumn("name", null));
			accordion.columns.add(new AccordionColumn("tablespace name", null));
			accordion.columns.add(new AccordionColumn("high value", null));
			accordion.columns.add(new AccordionColumn("high value length", null));
			accordion.columns.add(new AccordionColumn("interval", null));
			accordion.columns.add(new AccordionColumn("jsonDetails", null));
			
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
	
	private void fromConstraintList(List<Constraint> constraintList, Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "Constraints";
			accordion.columns.add(new AccordionColumn("name", null));
			accordion.columns.add(new AccordionColumn("type", null));
			accordion.columns.add(new AccordionColumn("columns", null));
			accordion.columns.add(new AccordionColumn("check", null));
			accordion.columns.add(new AccordionColumn("FK constraint owner", null));
			accordion.columns.add(new AccordionColumn("FK constraint name", null));
			accordion.columns.add(new AccordionColumn("FK table", null));
			accordion.columns.add(new AccordionColumn("FK columns", null));
			accordion.columns.add(new AccordionColumn("jsonDetails", null));
			
			for(Constraint constraint : constraintList) {
				accordion.data.add(new String[] {
					constraint.name,
					constraint.type,
					constraint.columns,
					constraint.checkCondition,
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
	
	private void fromFkList(List<Constraint> constraintList, Accordion accordion) {
		accordion.columns = new ArrayList<>();
		accordion.data = new ArrayList<>();

		try {
			accordion.title = "FK from/to this table";
			accordion.columns.add(new AccordionColumn("direction", "fkDirection"));
			accordion.columns.add(new AccordionColumn("name", null));
			accordion.columns.add(new AccordionColumn("columns", null));
			accordion.columns.add(new AccordionColumn("FK table", "tableLink"));
			accordion.columns.add(new AccordionColumn("FK columns", null));
			
			for(Constraint constraint : constraintList) {
				accordion.data.add(new String[] {
					constraint.fkDirection,
					constraint.fkDirection.equals("toTheTable") ? constraint.fkConstraintName : constraint.name,
					constraint.columns,
					constraint.fkConstraintOwner+"."+constraint.fkTable,
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
		
		Accordion columns          = new Accordion();
		Accordion indexes          = new Accordion();
		Accordion constraints      = new Accordion();
		Accordion fks              = new Accordion();
		Accordion partitioningKeys = new Accordion();
		Accordion partitions       = new Accordion();

		response.accordions.add(columns);
		response.accordions.add(indexes);
		response.accordions.add(constraints);
		response.accordions.add(fks);
		response.accordions.add(partitioningKeys);
		response.accordions.add(partitions);
		
		List<Column> columnList = connection.getTableColumnsDetails(owner, tableName);
		fromColumnsList(columnList,  columns);
		
		List<Index> indexList = connection.getTableIndexesDetails(owner, tableName);
		fromIndexList(indexList,  indexes);
		
		List<Constraint> constraintList = connection.getTableConstraintsDetails(owner, tableName);
		fromConstraintList(constraintList,  constraints);
		
		List<Constraint> fkList = connection.getTableFks(owner, tableName);
		fromFkList(fkList,  fks);

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
