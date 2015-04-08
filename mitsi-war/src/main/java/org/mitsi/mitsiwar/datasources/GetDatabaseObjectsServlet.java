package org.mitsi.mitsiwar.datasources;

import java.util.Map;

import org.mitsi.datasources.MitsiDatasource;
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

	@Autowired
	private PublicDatasources publicDatasources;

	
	public GetDatabaseObjectsServlet() {
        super(GetDatabaseObjects.class);
    }

 
	@Override
	public GetDatabaseObjectsResponse proceed(GetDatabaseObjects request, Client connectedClient) throws Exception {
		
		MultiConnection connection = connectedClient.getConnection(request.datasourceName);
		
		GetDatabaseObjectsResponse response = new GetDatabaseObjectsResponse();

//		connection.clearCache();
		//try {
			response.databaseObjects = connection.getConnectionForMitsi().getTablesAndViews(null);
			response.schemas = connection.getConnectionForMitsi().getAllSchemas();
		//}
		//finally {
		//	connection.rollback();
		//}

		return response;
	}

}
