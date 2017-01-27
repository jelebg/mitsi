package org.mitsi.mitsiwar.client;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

import org.apache.log4j.Logger;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;

public class GetClientStatusServlet extends GsonServlet<GetClientStatus, GetClientStatusResponse> {
	private static final Logger log = Logger.getLogger(GetClientStatusServlet.class);
	private static final long serialVersionUID = 1L;

	public GetClientStatusServlet() {
        super(GetClientStatus.class);
    }

 
	@Override
	public GetClientStatusResponse proceed(GetClientStatus request, Client connectedClient) throws Exception {
	
		GetClientStatusResponse response = new GetClientStatusResponse();

		response.connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = null;
		if(response.connectedUsername != null) {
			groups = mitsiUsersConfig.getUserGrantedGroups(response.connectedUsername);
		}
		
		response.datasources = new ArrayList<>();
		List<MitsiDatasource> mitsiDatasourceList = mitsiDatasources.getDatasources(groups, response.connectedUsername!=null);
		
		for(MitsiDatasource mitsiDatasource : mitsiDatasourceList) {
			
			Datasource datasource = new Datasource();
			datasource.name = mitsiDatasource.getName();
			datasource.description = mitsiDatasource.getDescription();
			datasource.tags = mitsiDatasource.getTags();
			response.datasources.add(datasource);
		}
		
		return response;
	}

}
