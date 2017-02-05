package org.mitsi.mitsiwar.client;

import org.apache.log4j.Logger;
import org.mitsi.core.DatasourceManager;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;

public class GetServerInfoServlet extends GsonServlet<GetServerInfo,GetServerInfoResponse> {
	private static final Logger log = Logger.getLogger(GetServerInfoServlet.class);
	private static final long serialVersionUID = 1L;

	public GetServerInfoServlet() {
        super(GetServerInfo.class);
    }

 
	@Override
	public GetServerInfoResponse proceed(GetServerInfo request, Client connectedClient) throws Exception {
	
		GetServerInfoResponse response = new GetServerInfoResponse();

		response.warVersion = DatasourceManager.class.getPackage().getImplementationVersion();
		
		return response;
	}

}
