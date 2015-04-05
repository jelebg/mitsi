package org.mitsi.mitsiwar.connections;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.mitsi.mitsiwar.filters.CleanerListener;

public class Clients {
	private static final Logger log = Logger.getLogger(Clients.class);
	
	private List<Client> clients = new ArrayList<Client>();
	
	public Clients() {
		
	}
	
	public void add(Client client) {
		clients.add(client);
	}
	
	public void disconnectAll() {
		log.debug("closings connections of "+clients.size()+" remaining clients");
		for(Client client : clients) {
			client.disconnect();
		}
	}
}
 