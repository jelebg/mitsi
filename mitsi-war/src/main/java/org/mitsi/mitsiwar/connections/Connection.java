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

public class Connection {
	private static final Logger log = Logger.getLogger(Connection.class);
	boolean connected = true;
	MitsiConnection mitsiConnection;
	
	
	public Connection(MitsiDatasource mitsiDatasource) throws ClassNotFoundException, SQLException {
		this.mitsiConnection = new MitsiConnection(mitsiDatasource);
		this.mitsiConnection.connect();
		this.mitsiConnection.getMapper().testOK();
		log.info("Connection OK to "+mitsiDatasource.getName());
	}

	public void disconnect() {
		if(!connected) {
			log.debug("not connected !!!");
		}
		else {
			String datasourceName = null;
			if(mitsiConnection!=null && mitsiConnection.getDatasource()!=null) {
				datasourceName = mitsiConnection.getDatasource().getName();
			}
			connected = false;
			mitsiConnection.close();
			mitsiConnection = null;
			log.info("disconnected from "+datasourceName);
		}
	}

	public boolean isConnected() {
		return connected;
	}
	
	public IMitsiMapper getMapper() {
		if(mitsiConnection==null) {
			return null;
		}
		return mitsiConnection.getMapper();
	}

	public void clearCache() {
		mitsiConnection.clearCache();
	}
	public void rollback() {
		mitsiConnection.rollback();
	}
	public void commit() {
		mitsiConnection.commit();
	}
	
	public List<Column> rawSelectBegin(String sql) throws SQLException, MitsiDatasourceException { // TODO : parameters
		return mitsiConnection.rawSelectBegin(sql);
	}
	public List<String[]> rawSelectFetch(int nbRowToFetch) throws SQLException, MitsiDatasourceException { 
		return mitsiConnection.rawSelectFetch(nbRowToFetch);
	}
	public void rawSelectEnd() throws SQLException, MitsiDatasourceException {
		rawSelectEnd();
	}

}
