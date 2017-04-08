package org.mitsi.mitsiwar.data;

import java.sql.SQLException;
import java.util.List;
import java.util.TreeSet;

import org.mitsi.commons.MitsiException;
import org.mitsi.commons.pojos.Filter;

import org.apache.log4j.Logger;
import org.mitsi.commons.pojos.OrderByColumn;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.mitsiwar.GsonResponse;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.beans.factory.annotation.Autowired;

class GetData {
	String datasourceName;
	String owner;
	String objectName;
	String table;
	OrderByColumn[] orderByColumns;
	long fromRow;
	long count;
	Filter[] filters;
	
	public GetData() {
	}
}

class GetDataResponse extends GsonResponse {
	List<Column> columns;
	List<String[]> results;
	boolean maxRowsReached;
	
	public GetDataResponse() {}
}


public class GetDataServlet extends GsonServlet<GetData, GetDataResponse> {
	private static final Logger log = Logger.getLogger(GetDataServlet.class);
	private static final long serialVersionUID = 1L;
	
	@Autowired
	private DatasourceManager datasourceManager;

	public GetDataServlet() {
        super(GetData.class);
    }
 
	@Override
	public GetDataResponse proceed(GetData request, Client connectedClient) throws MitsiException {
		
		GetDataResponse response = new GetDataResponse();

		String connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);
		
		try (MitsiConnection connection = datasourceManager.getConnection(groups, connectedUsername!=null, request.datasourceName)) {
			long maxRows = connection.getMaxExportRows();
			long rowCount = request.count<=0||request.count>maxRows?maxRows:request.count;
			
			MitsiConnection.GetDataResult result = connection.getData(
					request.owner, request.objectName, 
					request.fromRow, rowCount, 
					request.orderByColumns, request.filters);
			
			response.columns = result.columns;
			response.results = result.results;
			response.maxRowsReached = response.results.size()==maxRows;
		}
		catch(SQLException e) {
			log.error("error in GetDataServlet", e);
			throw new MitsiException("error in GetDataServlet", e);
		}
		
		return response;
	}




}
