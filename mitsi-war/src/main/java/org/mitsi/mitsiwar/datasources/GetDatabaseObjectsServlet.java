package org.mitsi.mitsiwar.datasources;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.Schema;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.connections.MultiConnection;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
public class GetDatabaseObjectsServlet extends GsonServlet<GetDatabaseObjects, GetDatabaseObjectsResponse> {
	private static final long serialVersionUID = 1L;
	private static final Logger log = Logger.getLogger(GetDatabaseObjectsServlet.class);

	@Autowired
	private PublicDatasources publicDatasources;

	
	public GetDatabaseObjectsServlet() {
        super(GetDatabaseObjects.class);
    }

 
	@Override
	public GetDatabaseObjectsResponse proceed(GetDatabaseObjects request, Client connectedClient) throws Exception {
		
		MultiConnection connection = connectedClient.getConnection(request.datasourceName);
		
		GetDatabaseObjectsResponse response = new GetDatabaseObjectsResponse();

		// TODO problèmes dans la gestion du cache à revoir complètement
		//connection.getConnectionForMitsi().clearCache();
		//try {
		
		response.schemas = connection.getConnectionForMitsi().getAllSchemas();
		String schema = request.schema;
		if(schema == null) {
			for(Schema s : response.schemas) {
				if(s.current) {
					schema = s.name;
					break;
				}
			}
		}
		response.databaseObjects = connection.getConnectionForMitsi().getTablesAndViews(schema);
		
		
		
		//}
		//finally {
		//	connection.getConnectionForMitsi().rollback();
		//}

		return response;
	}

}
