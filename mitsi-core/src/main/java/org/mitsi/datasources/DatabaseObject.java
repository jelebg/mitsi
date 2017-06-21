package org.mitsi.datasources;

import java.util.ArrayList;
import java.util.List;

@SuppressWarnings("squid:ClassVariableVisibilityCheck")
public class DatabaseObject {
	public static class Id {
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
		@Override
		public int hashCode() {
			// TODO : check if can be necessary to check type also
			final int prime = 31;
			int result = 1;
			result = prime * result + ((name == null) ? 0 : name.hashCode());
			result = prime * result
					+ ((schema == null) ? 0 : schema.hashCode());
			return result;
		}
		@Override
		public boolean equals(Object obj) {
			// TODO : check if can be necessary to check type also
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			Id other = (Id) obj;
			if (name == null) {
				if (other.name != null)
					return false;
			} else if (!name.equals(other.name))
				return false;
			if (schema == null) {
				if (other.schema != null)
					return false;
			} else if (!schema.equals(other.schema))
				return false;
			return true;
		}
		
		
		
	}
	
	private Id id;
	private String secondaryType;
	private String description;
	private List<Column> columns = new ArrayList<>();
	private List<Index> indexes = new ArrayList<>();
	private List<Constraint> constraints = new ArrayList<>();
	
	public List<Column> getColumns() {
		return columns;
	}

	public void setColumns(List<Column> columns) {
		this.columns = columns;
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<Index> getIndexes() {
		return indexes;
	}

	public void setIndexes(List<Index> indexes) {
		this.indexes = indexes;
	}

	public List<Constraint> getConstraints() {
		return constraints;
	}

	public void setConstraints(List<Constraint> constraints) {
		this.constraints = constraints;
	}
	
	


}
