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
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;

public class GetClientStatusServlet extends GsonServlet<GetClientStatus, GetClientStatusResponse> {
	private static final Logger log = Logger.getLogger(GetClientStatusServlet.class);
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;
	@Autowired
	private MitsiUsersConfig mitsiUsersConfig;

	
	public GetClientStatusServlet() {
        super(GetClientStatus.class);
    }

 
	@Override
	public GetClientStatusResponse proceed(GetClientStatus request, Client connectedClient) throws Exception {
		
		publicDatasources.loadIfNeccessary();
		mitsiUsersConfig.loadIfNeccessary();
	
		GetClientStatusResponse response = new GetClientStatusResponse();

		response.connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = null;
		if(response.connectedUsername != null) {
			groups = mitsiUsersConfig.getUserGrantedGroups(response.connectedUsername);
		}
		
		Map<String, MitsiDatasource> datasources = publicDatasources.getDatasources();
		for(MitsiDatasource publicDatasource : datasources.values()) {
			if(!publicDatasource.getUserGroups().contains(  MitsiUsersConfig.GROUP_PUBLIC ) &&
			   !(response.connectedUsername!=null && publicDatasource.getUserGroups().contains(  MitsiUsersConfig.GROUP_CONNECTED)) && 
				(groups == null || Collections.disjoint(publicDatasource.getUserGroups(), groups))) {
				// skip if no group in common with user, and datasource is not public, and datasource is not reserved to connected users (if user is connected)
				continue;
			}
			
			Datasource datasource = new Datasource();
			datasource.name = publicDatasource.getName();
			datasource.description = publicDatasource.getDescription();
			datasource.tags = publicDatasource.getTags();
			response.datasources.add(datasource);
		}
		
		return response;
	}

}
