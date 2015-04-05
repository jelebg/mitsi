package org.mitsi.mitsiwar.details;

import java.util.ArrayList;
import java.util.List;

import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Tablespace;
import org.mitsi.mitsiwar.common.Datasource;

public class GetDetailsResponse {
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
