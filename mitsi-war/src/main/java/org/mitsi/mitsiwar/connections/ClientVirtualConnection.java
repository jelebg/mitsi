package org.mitsi.mitsiwar.connections;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.IMitsiMapper;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.exceptions.MitsiDatasourceException;
import org.mitsi.users.PooledResource;

// TODO : supprimer la classe
public class ClientVirtualConnection {
	private static final Logger log = Logger.getLogger(ClientVirtualConnection.class);
	
	MitsiDatasource mitsiDatasource;
	boolean connected = true;
	
	public ClientVirtualConnection(MitsiDatasource mitsiDatasource) throws ClassNotFoundException, SQLException {
		this.mitsiDatasource = mitsiDatasource;
		this.connected = true;
		log.info("Connection OK to "+mitsiDatasource.getName());
	}
	
	public void disconnectAll() {
		if(!connected) {
			log.debug("not connected !!!");
		}
		else {

			connected = false;
			
			log.info("disconnected from "+mitsiDatasource.getName());
		}
	}

	public boolean isConnected() {
		return connected;
	}
	


}
