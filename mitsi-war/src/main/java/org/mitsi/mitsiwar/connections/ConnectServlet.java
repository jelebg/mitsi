package org.mitsi.mitsiwar.connections;

import java.util.Map;

import org.apache.ibatis.exceptions.PersistenceException;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.exception.AlreadyConnectedException;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
public class ConnectServlet extends GsonServlet<Connect, ConnectResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;

	
	public ConnectServlet() {
        super(Connect.class);
    }

 
	@Override
	public ConnectResponse proceed(Connect request, Client client) throws Exception {
		
		
		ConnectResponse response = new ConnectResponse();
		
		try {
			client.connectDatasource(request.datasourceName);
			response.connected = true;
			response.errorMessage = null;
		}
		catch (AlreadyConnectedException e) {
			response.connected = false;
			response.errorMessage = "already connected to "+request.datasourceName;
		}
		catch (java.sql.SQLException|PersistenceException e) {
			response.connected = false;
			response.errorMessage = getErrorMessageFromException(e);
		}
		return response;
	}
	
	private String getErrorMessageFromException(Exception e) {
		String message = e.getMessage();
		if(e instanceof java.sql.SQLException) {
			message = "SQL error : "+((java.sql.SQLException) e).getMessage();
		}
		else if(e instanceof PersistenceException) {
			Throwable e2 = e.getCause();
			if(e2 instanceof java.sql.SQLException) {
				message = "SQL error : "+((java.sql.SQLException) e2).getMessage();
			}
		}
		return message;
	}

}
