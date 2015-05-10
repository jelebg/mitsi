package org.mitsi.mitsiwar.datasources;

import java.util.List;
import java.util.Map;

import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.connections.MultiConnection;
import org.mitsi.mitsiwar.exception.NotConnectedException;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
// TODO : to be replaced by GetClientStatus
public class ChangeCurrentSchemaServlet extends GsonServlet<ChangeCurrentSchema, ChangeCurrentSchemaResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;

	
	public ChangeCurrentSchemaServlet() {
        super(ChangeCurrentSchema.class);
    }

 
	@Override
	public ChangeCurrentSchemaResponse proceed(ChangeCurrentSchema request, Client connectedClient, List<MitsiConnection> usingConnections) throws Exception {
		
		publicDatasources.loadIfNeccessary();
		
		if(!connectedClient.isConnected(request.datasource)) {
			throw new NotConnectedException();
		}
		
		MultiConnection connection = connectedClient.getConnection(request.datasource);
		connection.getConnectionForMitsi().changeSchema(request.schema);
		
		return new ChangeCurrentSchemaResponse();
	}

}
