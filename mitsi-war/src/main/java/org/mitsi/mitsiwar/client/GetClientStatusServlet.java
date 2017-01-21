package org.mitsi.mitsiwar.client;

import java.util.Map;

import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;

public class GetClientStatusServlet extends GsonServlet<GetClientStatus, GetClientStatusResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;

	
	public GetClientStatusServlet() {
        super(GetClientStatus.class);
    }

 
	@Override
	public GetClientStatusResponse proceed(GetClientStatus request, Client connectedClient) throws Exception {
		
		publicDatasources.loadIfNeccessary();
		
		GetClientStatusResponse response = new GetClientStatusResponse();
		Map<String, MitsiDatasource> datasources = publicDatasources.getDatasources();
		for(MitsiDatasource publicDatasource : datasources.values()) {
			Datasource datasource = new Datasource();
			datasource.name = publicDatasource.getName();
			datasource.description = publicDatasource.getDescription();
			datasource.tags = publicDatasource.getTags();
			// TODO : supprimer cet attribut dans la gui aussi
			datasource.connected = true;
			response.datasources.add(datasource);
		}
		
		return response;
	}

}
