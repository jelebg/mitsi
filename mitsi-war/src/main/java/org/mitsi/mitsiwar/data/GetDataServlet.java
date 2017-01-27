package org.mitsi.mitsiwar.data;

import java.util.TreeSet;

import org.apache.log4j.Logger;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
// TODO : to be replaced by GetClientStatus
public class GetDataServlet extends GsonServlet<GetData, GetDataResponse> {
	private static final Logger log = Logger.getLogger(GetDataServlet.class);
	private static final long serialVersionUID = 1L;

	@Autowired
	private DatasourceManager datasourceManager;

	public GetDataServlet() {
        super(GetData.class);
    }
 
	@Override
	public GetDataResponse proceed(GetData request, Client connectedClient) throws Exception {
		
		GetDataResponse response = new GetDataResponse();

		String connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);
		
		try (MitsiConnection connection = datasourceManager.getConnection(groups, connectedUsername!=null, request.datasourceName)) {
			MitsiConnection.GetDataResult result = connection.getData(request.owner, request.objectName, request.fromRow, request.count);
			response.columns = result.columns;
			response.results = result.results;
		}
		
		return response;
	}




}
