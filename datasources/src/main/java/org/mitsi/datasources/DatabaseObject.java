package org.mitsi.datasources;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class DatabaseObject {
	public class Id {
		private String type;
		private String schema;
		private String name;

		public Id(String type, String schema, String name) {
			this.type = type;
			this.schema = schema;
			this.name = name;
		}
		public String getType() {
			return type;
		}
		public String getSchema() {
			return schema;
		}
		public String getName() {
			return name;
		}
	}
	public class Partition {
		public String name;
	}
	// TODO : sub-partitions ...
	
	private Id id;
	private String descriSption;
	private String jsonDetails;
	private List<Column> columns = new ArrayList<>();
	
	public String getJsonDetails() {
		return jsonDetails;
	}

	public void setJsonDetails(String jsonDetails) {
		this.jsonDetails = jsonDetails;
	}
	public List<Column> getColumns() {
		return columns;
	}

	public void setColumns(List<Column> columns) {
		this.columns = columns;
	}

	public List<Partition> getPartitions() {
		return partitions;
	}

	public void setPartitions(List<Partition> partitions) {
		this.partitions = partitions;
	}

	public boolean isPartitionned() {
		return partitionned;
	}

	public void setPartitionned(boolean partitionned) {
		this.partitionned = partitionned;
	}

	public String getPartitionningBy() {
		return partitionningBy;
	}

	public void setPartitionningBy(String partitionningBy) {
		this.partitionningBy = partitionningBy;
	}

	private List<Partition>  partitions= new ArrayList<>();
	private boolean partitionned = false;
	private String partitionningBy = null;
	

	public DatabaseObject(String type, String schema, String name) {
		this.id = new Id(type, schema, name);
	}
	
	public Id getId() {
		return id;
	}
	
	public String getType() {
		return id.getType();
	}
	
	public String getName() {
		return id.getName();
	}

	public String getSchema() {
		return id.getSchema();
	}

	public String getDescriSption() {
		return descriSption;
	}

	public void setDescriSption(String descriSption) {
		this.descriSption = descriSption;
	}


	
	


}
