package org.mitsi.mitsiwar.rawsql;

import java.util.List;
import java.util.Map;

import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.connections.MultiConnection;
import org.mitsi.mitsiwar.exception.AlreadyConnectedException;
import org.mitsi.mitsiwar.exception.NotConnectedException;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
public class RawSQLFetchServlet extends GsonServlet<RawSQLFetch, RawSQLFetchResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;

	
	public RawSQLFetchServlet() {
        super(RawSQLFetch.class);
    }

 
	@Override
	public RawSQLFetchResponse proceed(RawSQLFetch request, Client client, List<MitsiConnection> usingConnections) throws Exception {
		
		
		RawSQLFetchResponse response = new RawSQLFetchResponse();
		
		MultiConnection connection = client.getConnection(request.datasourceName);
		usingConnections.add(connection.getConnectionForRawSql());
		response.results = connection.rawSelectFetch(request.nbRowToFetch);
		
		//try {
			//client.disconnectDatasource(request.datasourceName);
			//response.disconnected = true;
			//response.warningMessage = null;
		//}
		//catch (NotConnectedException e) {
		//	response.disconnected = false;
		//	response.warningMessage = "Not connected to "+request.datasourceName;
		//}
		return response;
	}



}
