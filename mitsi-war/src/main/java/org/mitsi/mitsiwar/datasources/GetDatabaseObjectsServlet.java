package org.mitsi.mitsiwar.datasources;

import java.util.List;
import java.util.TreeSet;

import org.apache.log4j.Logger;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.Schema;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.exception.MitsiWarException;
import org.springframework.beans.factory.annotation.Autowired;

class GetDatabaseObjects {
	String datasourceName;
	String schema;
	Boolean light;
	
	public GetDatabaseObjects() {
	}
}

class GetDatabaseObjectsResponse {
	List<DatabaseObject> databaseObjects;
	List<Schema> schemas;
	
	public GetDatabaseObjectsResponse() {}
}

public class GetDatabaseObjectsServlet extends GsonServlet<GetDatabaseObjects, GetDatabaseObjectsResponse> {
	private static final long serialVersionUID = 1L;
	private static final Logger log = Logger.getLogger(GetDatabaseObjectsServlet.class);

	@Autowired
	private DatasourceManager datasourceManager;
	
	public GetDatabaseObjectsServlet() {
        super(GetDatabaseObjects.class);
    }

 
	@Override
	public GetDatabaseObjectsResponse proceed(GetDatabaseObjects request, Client connectedClient) throws Exception {
		GetDatabaseObjectsResponse response = new GetDatabaseObjectsResponse();

		MitsiConnection connection = null;
		try  {
			try {
				String connectedUsername = connectedClient.getConnectedUsername();
				TreeSet<String> groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);
				connection = datasourceManager.getConnection(groups, connectedUsername!=null, request.datasourceName);
			}
			catch(Exception e) {
				log.error("could not connect to database : "+request.datasourceName, e);
				throw new MitsiWarException("could not connect to database : "+request.datasourceName);
			}

			
			String schema = request.schema;
			response.schemas = connection.getAllSchemas(schema);
			if(schema != null) {
				for(Schema s : response.schemas) {
					s.current = schema.equals(s.name);
				}
			}
			
			if(request.light) {
				response.databaseObjects = connection.getTablesAndViewsLight(schema);
			}
			else {
				response.databaseObjects = connection.getTablesAndViews(schema);
			}
			
		} 
		catch(Exception e) {
			log.error("could not connect to database : "+request.datasourceName, e);
			throw new MitsiWarException("could not connect to database : "+request.datasourceName);
		}
		finally {
			if(connection != null) {
				connection.close();
			}
		}


		return response;
	}

}
