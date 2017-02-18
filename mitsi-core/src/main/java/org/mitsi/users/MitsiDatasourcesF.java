package org.mitsi.users;

import java.util.HashMap;

public class MitsiDatasourcesF {
	public HashMap<String, Datasource> datasources;

	public class Datasource {
		String [] userGroups;
		String description;
		String provider;
		String driver;
		String jdbcUrl;
		String user;
		String password;
		String [] tags;
		String connectSchema;
		Long maxExportRows;
	}

}
