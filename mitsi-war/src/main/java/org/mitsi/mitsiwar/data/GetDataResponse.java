package org.mitsi.mitsiwar.data;

import java.util.List;

import org.mitsi.datasources.Column;
import org.mitsi.mitsiwar.GsonResponse;



public class GetDataResponse extends GsonResponse {
	List<Column> columns;
	List<String[]> results;
	
	public GetDataResponse() {}
}
