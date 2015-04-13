package org.mitsi.mitsiwar.links;

import java.util.ArrayList;
import java.util.List;

import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Relation;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Tablespace;
import org.mitsi.mitsiwar.common.Datasource;

public class GetAllRelationsResponse {
	List<Relation> relations;
	String message;
	
	public GetAllRelationsResponse() {}
}
