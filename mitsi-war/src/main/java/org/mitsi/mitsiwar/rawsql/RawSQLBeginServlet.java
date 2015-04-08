package org.mitsi.mitsiwar.rawsql;

import java.util.Map;

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
public class RawSQLBeginServlet extends GsonServlet<RawSQLBegin, RawSQLBeginResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;

	
	public RawSQLBeginServlet() {
        super(RawSQLBegin.class);
    }

 
	@Override
	public RawSQLBeginResponse proceed(RawSQLBegin request, Client client) throws Exception {
		
		
		RawSQLBeginResponse response = new RawSQLBeginResponse();
		
		MultiConnection connection = client.getConnection(request.datasourceName);
		response.columns = connection.rawSelectBegin(request.sql);
		if(request.nbRowToFetch > 0) {
			response.results = connection.rawSelectFetch(request.nbRowToFetch);
		}
		
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
