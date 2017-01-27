package org.mitsi.mitsiwar.datasources;

import java.util.TreeSet;

import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
// TODO : to be replaced by GetClientStatus
public class ChangeCurrentSchemaServlet extends GsonServlet<ChangeCurrentSchema, ChangeCurrentSchemaResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private DatasourceManager datasourceManager;

	
	public ChangeCurrentSchemaServlet() {
        super(ChangeCurrentSchema.class);
    }

 
	@Override
	public ChangeCurrentSchemaResponse proceed(ChangeCurrentSchema request, Client connectedClient) throws Exception {
		
		String connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);

		try (MitsiConnection connection = datasourceManager.getConnection(groups, connectedUsername!=null, request.datasource)) { 
		
			connection.changeSchema(request.schema);
		}
		
		return new ChangeCurrentSchemaResponse();
	}

}
