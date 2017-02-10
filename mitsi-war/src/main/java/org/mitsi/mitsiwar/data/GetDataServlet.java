package org.mitsi.mitsiwar.data;

import java.util.List;
import java.util.TreeSet;

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
	
	public GetData() {
	}
}

class GetDataResponse extends GsonResponse {
	List<Column> columns;
	List<String[]> results;
	
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
	public GetDataResponse proceed(GetData request, Client connectedClient) throws Exception {
		
		GetDataResponse response = new GetDataResponse();

		String connectedUsername = connectedClient.getConnectedUsername();
		TreeSet<String> groups = mitsiUsersConfig.getUserGrantedGroups(connectedUsername);
		
		try (MitsiConnection connection = datasourceManager.getConnection(groups, connectedUsername!=null, request.datasourceName)) {
			MitsiConnection.GetDataResult result = connection.getData(request.owner, request.objectName, request.fromRow, request.count, request.orderByColumns);
			response.columns = result.columns;
			response.results = result.results;
		}
		
		return response;
	}




}
