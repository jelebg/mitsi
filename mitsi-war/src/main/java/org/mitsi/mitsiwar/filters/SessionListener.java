package org.mitsi.mitsiwar.filters;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.apache.log4j.Logger;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.connections.Clients;

public class SessionListener implements HttpSessionListener {
	private static final Logger log = Logger.getLogger(SessionListener.class);

	@Override
	public void sessionCreated(HttpSessionEvent event) {
		//log.debug("creating session : "+event.getSession().getId());
	}

	@Override
	public void sessionDestroyed(HttpSessionEvent event) {
		log.info("destroying session : "+event.getSession().getId());
		Client client = (Client) event.getSession().getAttribute(GsonServlet.CONNECTED_CLIENTSESSION_ATTRIBUTE);
		if(client != null) {
			log.info("clogins all "+client.getConnectionCount()+" remaining connections of client");
			client.disconnect();
		}
	}

}
