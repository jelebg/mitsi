package org.mitsi.mitsiwar.client;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.core.DatasourceManager;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;

final class GetServerInfo {
	
	public GetServerInfo() {
	}
}

final class GetServerInfoResponse {

	String warVersion;
	
	public GetServerInfoResponse() {
		
	}
}


public class GetServerInfoServlet extends GsonServlet<GetServerInfo, GetServerInfoResponse> {
	private static final Logger log = Logger.getLogger(GetServerInfoServlet.class);
	private static final long serialVersionUID = 1L;

	public GetServerInfoServlet() {
        super(GetServerInfo.class);
    }

 
	@Override
	public GetServerInfoResponse proceed(GetServerInfo request, Client connectedClient) throws MitsiException {
	
		GetServerInfoResponse response = new GetServerInfoResponse();

		response.warVersion = DatasourceManager.class.getPackage().getImplementationVersion();
		
		return response;
	}

}
