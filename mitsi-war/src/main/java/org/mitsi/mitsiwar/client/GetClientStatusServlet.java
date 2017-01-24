package org.mitsi.mitsiwar.client;

import java.util.Collections;
import java.util.Map;
import java.util.TreeSet;

import org.apache.log4j.Logger;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.users.MitsiUsersConfig;
import org.mitsi.users.MitsiDatasources;
import org.springframework.beans.factory.annotation.Autowired;

public class GetClientStatusServlet extends GsonServlet<GetClientStatus, GetClientStatusResponse> {
	private static final Logger log = Logger.getLogger(GetClientStatusServlet.class);
	private static final long serialVersionUID = 1L;

	@Autowired
	private MitsiDatasources mitsiDatasources;
	@Autowired
	private MitsiUsersConfig mitsiUsersConfig;

	
	public GetClientStatusServlet() {
        super(GetClientStatus.class);
    }

 
	@Override
	public GetClientStatusResponse proceed(GetClientStatus request, Client connectedClient) throws Exception {
		
		mitsiDatasources.loadIfNeccessary();
		mitsiUsersConfig.loadIfNeccessary();
	
		GetClientStatusResponse response = new GetClientStatusResponse();

		response.connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = null;
		if(response.connectedUsername != null) {
			groups = mitsiUsersConfig.getUserGrantedGroups(response.connectedUsername);
		}
		
		Map<String, MitsiDatasource> datasources = mitsiDatasources.getDatasources();
		for(MitsiDatasource mitsiDatasources : datasources.values()) {
			if(!mitsiDatasources.getUserGroups().contains(  MitsiUsersConfig.GROUP_PUBLIC ) &&
			   !(response.connectedUsername!=null && mitsiDatasources.getUserGroups().contains(  MitsiUsersConfig.GROUP_CONNECTED)) && 
				(groups == null || Collections.disjoint(mitsiDatasources.getUserGroups(), groups))) {
				// skip if no group in common with user, and datasource is not public, and datasource is not reserved to connected users (if user is connected)
				continue;
			}
			
			Datasource datasource = new Datasource();
			datasource.name = mitsiDatasources.getName();
			datasource.description = mitsiDatasources.getDescription();
			datasource.tags = mitsiDatasources.getTags();
			response.datasources.add(datasource);
		}
		
		return response;
	}

}
