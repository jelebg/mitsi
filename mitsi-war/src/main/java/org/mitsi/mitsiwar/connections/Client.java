package org.mitsi.mitsiwar.connections;

import java.io.Serializable;

public class Client implements Serializable {
	private static final long serialVersionUID = -5140866808683891062L;

	private String username; // null for anonymous
	
	public Client() {
		this.username = null;
		
	}
	
	public void login(String userName) {
		this.username = userName;
	}

	public void logout() {
		username = null;
	}
	
	public String getConnectedUsername() {
		return username;
	}

}
