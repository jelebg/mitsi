package org.mitsi.mitsiwar.datasources;

import java.util.List;

import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Schema;

public class GetDatabaseObjectsResponse {
	List<DatabaseObject> databaseObjects;
	List<Schema> schemas;
	
	String errorMessage;
	
	public GetDatabaseObjectsResponse() {}
}
