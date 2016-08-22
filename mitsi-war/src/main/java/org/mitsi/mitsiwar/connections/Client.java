package org.mitsi.mitsiwar.connections;

import java.util.Map;
import java.util.TreeMap;

import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

public class Client {
	private String userName; // null for anonymous
	private Map<String, ClientVirtualConnection> publicConnections = new TreeMap<>();
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
		for(ClientVirtualConnection connection : publicConnections.values()) {
			connection.disconnectAll();
		}
	}

}
