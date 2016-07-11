package org.mitsi.mitsiwar.filters;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.log4j.Logger;
import org.mitsi.mitsiwar.connections.Clients;
import org.mitsi.mitsiwar.connections.ClientVirtualConnection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

public class CleanerListener implements ServletContextListener {
	private static final Logger log = Logger.getLogger(CleanerListener.class);

	@Autowired
	Clients clients;
	
	@Override
	public void contextDestroyed(ServletContextEvent arg0) {
		log.info("servlet context destroyed");
		clients.disconnectAll();
	}

	@Override
	public void contextInitialized(ServletContextEvent arg0) {
		log.debug("servlet context initialized");
	    SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
	}

}
