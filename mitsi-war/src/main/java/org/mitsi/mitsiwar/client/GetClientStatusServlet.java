package org.mitsi.mitsiwar.client;

import java.util.ArrayList;
import java.util.List;
import java.util.SortedSet;
import java.util.TreeSet;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;

class Request {
	boolean btwGetDatasources;
	
	public Request() {
	}
}

class Response {

	String connectedUsername;
	List<Datasource> datasources;
	
	public Response() {
	}
}


public class GetClientStatusServlet extends GsonServlet<Request, Response> {
	private static final Logger log = Logger.getLogger(GetClientStatusServlet.class);
	private static final long serialVersionUID = 1L;
	
	public GetClientStatusServlet() {
        super(Request.class);
    }

 
	@Override
	public Response proceed(Request request, Client connectedClient) throws MitsiException {
	
		Response response = new Response();

		response.connectedUsername = connectedClient.getConnectedUsername();
		response.datasources = null;
		SortedSet<String> groups = null;
		if(response.connectedUsername != null) {
			groups = mitsiUsersConfig.getUserGrantedGroups(response.connectedUsername);
		}
		
		if(request.btwGetDatasources) {
			response.datasources = new ArrayList<>();
			List<MitsiDatasource> mitsiDatasourceList = mitsiDatasources.getDatasources(groups, response.connectedUsername!=null);
			
			for(MitsiDatasource mitsiDatasource : mitsiDatasourceList) {
				
				Datasource datasource = new Datasource();
				datasource.name = mitsiDatasource.getName();
				datasource.description = mitsiDatasource.getDescription();
				datasource.tags = mitsiDatasource.getTags();
				response.datasources.add(datasource);
			}
		}
		
		return response;
	}

}
