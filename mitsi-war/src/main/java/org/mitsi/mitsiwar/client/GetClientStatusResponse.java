package org.mitsi.mitsiwar.client;

import java.util.ArrayList;
import java.util.List;

import org.mitsi.datasources.Schema;
import org.mitsi.mitsiwar.common.Datasource;

public class GetClientStatusResponse {

	List<Datasource> datasources = new ArrayList<>();
	
	public GetClientStatusResponse() {}
}
