package org.mitsi.mitsiwar.datasources;

import java.util.List;
import java.util.Map;

import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.users.MitsiDatasources;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
// TODO : to be replaced by GetClientStatus
public class GetDatasourcesServlet extends GsonServlet<GetDatasources, GetDatasourcesResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private MitsiDatasources mitsiDatasources;

	
	public GetDatasourcesServlet() {
        super(GetDatasources.class);
    }

 
	@Override
	public GetDatasourcesResponse proceed(GetDatasources request, Client connectedClient) throws Exception {
		
		mitsiDatasources.loadIfNeccessary();
		
		GetDatasourcesResponse response = new GetDatasourcesResponse();
		Map<String, MitsiDatasource> datasources = mitsiDatasources.getDatasources();
		for(MitsiDatasource mitsiDatasources : datasources.values()) {
			Datasource datasource = new Datasource();
			datasource.name = mitsiDatasources.getName();
			datasource.description = mitsiDatasources.getDescription();
			datasource.tags = mitsiDatasources.getTags();
			response.datasources.add(datasource);
		}
		
		return response;
	}

}
