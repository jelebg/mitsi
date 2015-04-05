package org.mitsi.mitsiwar.rawsql;

import java.util.List;

import org.mitsi.datasources.Column;

public class RawSQLBeginResponse {
	List<Column> columns;
	List<String[]> results;
	
	public RawSQLBeginResponse() {}
}
