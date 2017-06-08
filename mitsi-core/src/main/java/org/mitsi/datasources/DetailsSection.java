package org.mitsi.datasources;

import java.util.List;

public class DetailsSection {
	public class Column {
		public Column(String name, String displayType) {
			this.name = name;
			this.displayType = displayType;
		}
		public String name;
		public String displayType;
	}

	public String title;
	public List<Column> columns;
	public List<String[]> data;

}
