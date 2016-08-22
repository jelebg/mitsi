package org.mitsi.mitsiwar.datasources;

import java.util.List;
import java.util.Map;

import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
// TODO : to be replaced by GetClientStatus
public class GetDatasourcesServlet extends GsonServlet<GetDatasources, GetDatasourcesResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;

	
	public GetDatasourcesServlet() {
        super(GetDatasources.class);
    }

 
	@Override
	public GetDatasourcesResponse proceed(GetDatasources request, Client connectedClient) throws Exception {
		
		publicDatasources.loadIfNeccessary();
		
		GetDatasourcesResponse response = new GetDatasourcesResponse();
		Map<String, MitsiDatasource> datasources = publicDatasources.getDatasources();
		for(MitsiDatasource publicDatasource : datasources.values()) {
			Datasource datasource = new Datasource();
			datasource.name = publicDatasource.getName();
			datasource.description = publicDatasource.getDescription();
			datasource.tags = publicDatasource.getTags();
			response.datasources.add(datasource);
		}
		
		return response;
	}

}
