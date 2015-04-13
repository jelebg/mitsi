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

public class MultiConnection {
	private static final Logger log = Logger.getLogger(MultiConnection.class);
	
	MitsiDatasource mitsiDatasource;
	boolean connected = true;
	List<MitsiConnection> mitsiConnections;
	long maxConnections;
	
	
	public MultiConnection(MitsiDatasource mitsiDatasource) throws ClassNotFoundException, SQLException {
		this.mitsiDatasource = mitsiDatasource;
		this.maxConnections = mitsiDatasource.getMaxConnectionPerUser();
		this.mitsiConnections = new ArrayList<MitsiConnection>(maxConnections>1 ? 2 : 1);
		connectNew();
		if(maxConnections>1) {
			connectNew();
		}
		this.connected = true;
		log.info("Connection OK to "+mitsiDatasource.getName());
	}
	
	public int connectNew() throws ClassNotFoundException, SQLException {
		MitsiConnection newConnection = new MitsiConnection(mitsiDatasource);
		newConnection.connect();
		//this.mitsiConnection.testOK();// TODO : rétablire ?
		int ret = 0;
		
		synchronized(this.mitsiConnections) {
			ret = this.mitsiConnections.size();
			this.mitsiConnections.add(newConnection);
		}

		return ret;
	}

	public void disconnectAll() {
		if(!connected) {
			log.debug("not connected !!!");
		}
		else {

			connected = false;
			
			for(MitsiConnection mitsiConnection : mitsiConnections) {
				mitsiConnection.close();
			}
			mitsiConnections.clear();
			log.info("disconnected from "+mitsiDatasource.getName());
		}
	}

	public boolean isConnected() {
		return connected;
	}
	
	/*public IMitsiMapper getMapper() {
		if(mitsiConnection==null) {
			return null;
		}
		return mitsiConnection.getMapper();
	}*/
	
	// TODO : design a revoir, là ça sert juste à le synchroniser avec la SqlSession
	public IMitsiMapper getConnectionForMitsi() {
		return mitsiConnections.get(0);
	}
	private MitsiConnection getConnectionForRawSql() {
		// TODO : gérer plus de deux connections
		if(maxConnections > 1) {
			return mitsiConnections.get(1);
		}
		return mitsiConnections.get(0);
	}

	public void clearCacheAllForRawSql() {
		getConnectionForRawSql().clearCache();
	}
	public void rollbackForRawSql() {
		getConnectionForRawSql().rollback();
	}
	public void commitForRawSql() {
		getConnectionForRawSql().commit();
	}
	
	public List<Column> rawSelectBegin(String sql) throws SQLException, MitsiDatasourceException { // TODO : parameters
		return getConnectionForRawSql().rawSelectBegin(sql);
	}
	public List<String[]> rawSelectFetch(int nbRowToFetch) throws SQLException, MitsiDatasourceException { 
		return getConnectionForRawSql().rawSelectFetch(nbRowToFetch);
	}
	public void rawSelectEnd() throws SQLException, MitsiDatasourceException {
		getConnectionForRawSql().rawSelectEnd();
	}

}
