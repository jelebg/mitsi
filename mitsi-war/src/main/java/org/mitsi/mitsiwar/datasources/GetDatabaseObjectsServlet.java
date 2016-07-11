package org.mitsi.mitsiwar.datasources;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.Schema;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.connections.ClientVirtualConnection;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
public class GetDatabaseObjectsServlet extends GsonServlet<GetDatabaseObjects, GetDatabaseObjectsResponse> {
	private static final long serialVersionUID = 1L;
	private static final Logger log = Logger.getLogger(GetDatabaseObjectsServlet.class);

	@Autowired
	private DatasourceManager datasourceManager;
	//private PublicDatasources publicDatasources;

	
	public GetDatabaseObjectsServlet() {
        super(GetDatabaseObjects.class);
    }

 
	@Override
	public GetDatabaseObjectsResponse proceed(GetDatabaseObjects request, Client connectedClient) throws Exception {
		
		GetDatabaseObjectsResponse response = new GetDatabaseObjectsResponse();

		try (MitsiConnection connection = datasourceManager.getConnection(request.datasourceName)) { 
			
			response.schemas = connection.getAllSchemas();
			String schema = request.schema;
			if(schema == null) {
				for(Schema s : response.schemas) {
					if(s.current) {
						schema = s.name;
						break;
					}
				}
			}
			boolean disableCaching = (request.disableCaching!=null && request.disableCaching==true);
			
			response.databaseObjects = connection.getTablesAndViews(schema, disableCaching);
			
		}

		return response;
	}

}
