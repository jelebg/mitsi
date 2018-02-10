package org.mitsi.users;

import java.util.HashMap;
import java.util.List;

@SuppressWarnings("squid:ClassVariableVisibilityCheck")
public class MitsiDatasourcesF {
	public HashMap<String, Datasource> datasources;
	public HashMap<String, Layer> layers;

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
		Long maxRunningStatementPerUser;
		Pool pool;
	}

	public class Layer {
		String description;
		List<String> tags;
		String [] datasources;
	}
	
	public class Pool {
		Long initialSize;
		Long minSize;
		Long maxSize;
		Long maxIdleTimeSec;
		Long acquireIncrement;
	}

}
