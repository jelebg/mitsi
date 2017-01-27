package org.mitsi.mitsiwar.client;

import java.util.List;

import org.mitsi.mitsiwar.common.Datasource;

public class GetClientStatusResponse {

	String connectedUsername;
	List<Datasource> datasources;
	
	public GetClientStatusResponse() {}
}
