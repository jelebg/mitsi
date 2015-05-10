package org.mitsi.mitsiwar.client;

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
public class GetClientStatusServlet extends GsonServlet<GetClientStatus, GetClientStatusResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;

	
	public GetClientStatusServlet() {
        super(GetClientStatus.class);
    }

 
	@Override
	public GetClientStatusResponse proceed(GetClientStatus request, Client connectedClient, List<MitsiConnection> usingConnections) throws Exception {
		
		publicDatasources.loadIfNeccessary();
		
		GetClientStatusResponse response = new GetClientStatusResponse();
		Map<String, MitsiDatasource> datasources = publicDatasources.getDatasources();
		for(MitsiDatasource publicDatasource : datasources.values()) {
			Datasource datasource = new Datasource();
			datasource.name = publicDatasource.getName();
			datasource.description = publicDatasource.getDescription();
			datasource.tags = publicDatasource.getTags();
			datasource.connected = connectedClient.isConnected(publicDatasource.getName());
			response.datasources.add(datasource);
		}
		
		/*response.resultats.add("un");
		response.resultats.add("deux");
		response.resultats.add("trois");
		response.resultats.add("quatre");
		response.resultats.add("cinq");*/
		return response;
	}

}
