package org.mitsi.mitsiwar.links;

import java.util.List;
import java.util.TreeSet;

import org.apache.log4j.Logger;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.Relation;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.beans.factory.annotation.Autowired;

class GetAllRelations {
	String datasourceName;
	
	public GetAllRelations() {
	}
}

class GetAllRelationsResponse {
	List<Relation> relations;
	String message;
	
	public GetAllRelationsResponse() {}
}

public class GetAllRelationsServlet extends GsonServlet<GetAllRelations, GetAllRelationsResponse> {
	private static final Logger log = Logger.getLogger(GetAllRelationsServlet.class);
	private static final long serialVersionUID = 1L;

	@Autowired
	private DatasourceManager datasourceManager;
	
	public GetAllRelationsServlet() {
        super(GetAllRelations.class);
    }
	
	

 
	@Override
	public GetAllRelationsResponse proceed(GetAllRelations request, Client connectedClient) throws Exception {
		
		GetAllRelationsResponse response = new GetAllRelationsResponse();
		
		String connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);

		try (MitsiConnection connection = datasourceManager.getConnection(groups, connectedUsername!=null, request.datasourceName)) { 
			response.relations = connection.getAllRelations();
		}
		
		return response;
	}




}
