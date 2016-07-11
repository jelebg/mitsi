package org.mitsi.mitsiwar.connections;

import java.util.List;
import java.util.Map;

import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.exception.AlreadyConnectedException;
import org.mitsi.mitsiwar.exception.NotConnectedException;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
// TODO : supprimer cette servlet
public class DisconnectServlet extends GsonServlet<Disconnect, DisconnectResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;

	
	public DisconnectServlet() {
        super(Disconnect.class);
    }

 
	@Override
	public DisconnectResponse proceed(Disconnect request, Client client) throws Exception {
		
		
		DisconnectResponse response = new DisconnectResponse();
		
		/*try {
			client.disconnectDatasource(request.datasourceName);
			response.disconnected = true;
			response.warningMessage = null;
		}
		catch (NotConnectedException e) {
			response.disconnected = false;
			response.warningMessage = "Not connected to "+request.datasourceName;
		}*/
		return response;
	}

}
