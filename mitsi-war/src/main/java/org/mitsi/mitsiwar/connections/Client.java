package org.mitsi.mitsiwar.connections;

import java.util.Map;
import java.util.TreeMap;

import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

// pour l'instant on garde mais ça devrait être remplacé par une session
// pour l'instant ça ne sert pas, rien ne reste en session
public class Client {
	private String userName; // null for anonymous
	
	@Autowired
	private PublicDatasources publicDatasources;
	
	public Client(String userName) {
		this.userName = userName;
	    SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
		
	}
	
	public void disconnect() {
		// rien pour l'instant
	}

}
