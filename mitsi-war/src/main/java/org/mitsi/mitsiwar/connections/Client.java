package org.mitsi.mitsiwar.connections;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.exception.AlreadyConnectedException;
import org.mitsi.mitsiwar.exception.NotConnectedException;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

public class Client {
	private String userName; // null for anonymous
	private Map<String, Connection> publicConnections = new TreeMap<>();
	//private List<Connection> userConnections; // TODO : pour plus tard
	private boolean disconnected = false;
	
	@Autowired
	private Clients clients;
	
	@Autowired
	private PublicDatasources publicDatasources;
	
	public Client(String userName) {
		this.userName = userName;
	    SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
		clients.add(this);
		
	}
	
	public void disconnect() {
		disconnected = true;
		for(Connection connection : publicConnections.values()) {
			connection.disconnect();
		}
	}

	public void connectDatasource(String datasourceName)
			throws AlreadyConnectedException, ClassNotFoundException, SQLException {
		Connection connection = publicConnections.get(datasourceName);
		if(connection != null) {
			if(!connection.isConnected()) {
				publicConnections.remove(datasourceName);
			}
			else {
				throw new AlreadyConnectedException();
			}
		}
		
		MitsiDatasource mitsiDatasource = publicDatasources.getDatasource(datasourceName);
		publicConnections.put(datasourceName, new Connection(mitsiDatasource));
	}

	public void disconnectDatasource(String datasourceName) throws NotConnectedException {
		Connection connection = publicConnections.get(datasourceName);
		if(connection == null || !connection.isConnected()) {
			throw new NotConnectedException();
		}
		
		connection.disconnect();
		publicConnections.remove(datasourceName);
		
	}

	public boolean isConnected(String datasourceName) {
		return publicConnections.containsKey(datasourceName);
	}
	
	public Connection getConnection(String datasourceName) throws ClassNotFoundException, SQLException {
		Connection connection = publicConnections.get(datasourceName);
		if(connection != null) {
			return connection;
		}
		
		MitsiDatasource mitsiDatasource = publicDatasources.getDatasource(datasourceName);
		connection = new Connection(mitsiDatasource);
		publicConnections.put(datasourceName, connection);
		return connection;
	}
	
	
	public int getConnectionCount() {
		return publicConnections.size();
	}
}
