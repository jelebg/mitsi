package org.mitsi.mitsiwar.datasources;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;


/**
 * Servlet implementation class TestGsonServlet
 */
// TODO : to be replaced by GetClientStatus
public class GetDatasourcesServlet extends GsonServlet<GetDatasources, GetDatasourcesResponse> {
	private static final long serialVersionUID = 1L;

	public GetDatasourcesServlet() {
        super(GetDatasources.class);
    }

 
	@Override
	public GetDatasourcesResponse proceed(GetDatasources request, Client connectedClient) throws Exception {
		
		GetDatasourcesResponse response = new GetDatasourcesResponse();
		
		String connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);
		
		response.datasources = new ArrayList<>();
		List<MitsiDatasource> mitsiDatasourceList = mitsiDatasources.getDatasources(groups, connectedUsername!=null);

		for(MitsiDatasource mitsiDatasources : mitsiDatasourceList) {
			Datasource datasource = new Datasource();
			datasource.name = mitsiDatasources.getName();
			datasource.description = mitsiDatasources.getDescription();
			datasource.tags = mitsiDatasources.getTags();
			response.datasources.add(datasource);
		}
		
		return response;
	}

}
