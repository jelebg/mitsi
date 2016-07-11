package org.mitsi.mitsiwar.datasources;

import java.util.List;
import java.util.Map;

import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.connections.ClientVirtualConnection;
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
	private DatasourceManager datasourceManager;

	
	public ChangeCurrentSchemaServlet() {
        super(ChangeCurrentSchema.class);
    }

 
	@Override
	public ChangeCurrentSchemaResponse proceed(ChangeCurrentSchema request, Client connectedClient) throws Exception {
		

		try (MitsiConnection connection = datasourceManager.getConnection(request.datasource)) { 
		
			connection.changeSchema(request.schema);
		}
		
		return new ChangeCurrentSchemaResponse();
	}

}
