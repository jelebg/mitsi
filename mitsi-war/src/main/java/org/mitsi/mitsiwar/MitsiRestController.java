package org.mitsi.mitsiwar;

import java.io.Writer;
import java.util.List;
import java.util.SortedSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.validation.constraints.NotNull;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.api.DatasourceManager;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.MitsiLayer;
import org.mitsi.datasources.exceptions.MitsiDatasourceException;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.users.MitsiDatasources;
import org.mitsi.users.MitsiUsersConfig;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.gson.Gson;
import com.google.gson.JsonIOException;

class ErrorResponse {
	public String errorMessage;
}

public abstract class MitsiRestController {
	private static final Logger log = Logger.getLogger(MitsiRestController.class);
	public static final String CONNECTED_CLIENTSESSION_ATTRIBUTE = "MITSI_CONNECTED_CLIENT";

	@Autowired
	protected MitsiDatasources mitsiDatasources; //NOSONAR   
	@Autowired
	protected DatasourceManager datasourceManager; //NOSONAR 
	@Autowired
	protected MitsiUsersConfig mitsiUsersConfig; //NOSONAR 
	
	protected @NotNull Client getClient(HttpSession httpSession) {
		Client connectedClient = (Client) httpSession.getAttribute(CONNECTED_CLIENTSESSION_ATTRIBUTE);
		if(connectedClient == null) {
			connectedClient = new Client(); 
			httpSession.setAttribute(CONNECTED_CLIENTSESSION_ATTRIBUTE, connectedClient);
		}
		return connectedClient;
	}

	protected String getConnectedUsername(HttpSession httpSession) {
		Client client = getClient(httpSession);
		return client.getConnectedUsername();
	}

	protected @NotNull MitsiConnection getConnection(HttpSession httpSession, String datasourceName) throws MitsiUsersException, MitsiDatasourceException {
		String connectedUsername = getClient(httpSession).getConnectedUsername();
		SortedSet<String> groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);

		return datasourceManager.getConnection(groups, connectedUsername!=null, datasourceName);
	}

	public static class DatasourcesAndLayers {
		public List<MitsiDatasource> datasources;
		public List<MitsiLayer> layers;

		public DatasourcesAndLayers(List<MitsiDatasource> datasources, List<MitsiLayer> layers) {
			this.datasources = datasources;
			this.layers = layers;
		}
	}
	
	protected @NotNull DatasourcesAndLayers getDatasourcesAndLayers(HttpSession httpSession) {
		String connectedUsername = getConnectedUsername(httpSession);
		SortedSet<String> groups = null;
		if(connectedUsername != null) {
			groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);
		}
		return new DatasourcesAndLayers(
			mitsiDatasources.getDatasources(groups, connectedUsername!=null),
			mitsiDatasources.getLayers(groups, connectedUsername!=null)
		);
	}
	
	@ExceptionHandler(MitsiException.class)
	@ResponseBody
	public void handleException(final Exception e, final HttpServletRequest request,
	        Writer writer) {
		log.debug("generic error handling in GsonServlet", e );
		
		ErrorResponse response = new ErrorResponse();
		response.errorMessage = getErrorMessage(e);
		try {
			Gson gson = new Gson();
			gson.toJson(response, writer);
		}
		catch(JsonIOException e2) {
			log.error("error handling impossible because of error", e2);
		}
	}

	private String getErrorMessage(Throwable t) {
		
		StringBuilder message = new StringBuilder(t.getMessage());
		
		for(t=t.getCause(); t!=null; t=t.getCause()) {
			if(t instanceof java.sql.SQLRecoverableException) {
				java.sql.SQLRecoverableException sqlRecoverableException = (java.sql.SQLRecoverableException) t;
				message.append(" (")
					.append(sqlRecoverableException.getErrorCode())
					.append(" - ")
					.append(sqlRecoverableException.getMessage())
					.append(")");
				break;
			}
		}
		
		return message.toString();
	}

}
