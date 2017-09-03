package org.mitsi.mitsiwar.connections;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.mitsi.datasources.CancellableStatementsManager;

public class Client implements Serializable {
	private static final long serialVersionUID = -5140866808683891062L;
	private static final Logger log = Logger.getLogger(Client.class);

	private String username; // null for anonymous
	
	private ClientCancellableStatementsManager cancellableStatementsManager;

	public Client() {
		this.username = null;
		this.cancellableStatementsManager = new ClientCancellableStatementsManager();
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
	
	public ClientCancellableStatementsManager getCancelStatementManager() {
		return cancellableStatementsManager;
	}
}
