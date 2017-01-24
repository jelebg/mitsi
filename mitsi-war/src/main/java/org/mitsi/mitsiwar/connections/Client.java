package org.mitsi.mitsiwar.connections;

public class Client {
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
