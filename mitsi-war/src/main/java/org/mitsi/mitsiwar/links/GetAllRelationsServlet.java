package org.mitsi.mitsiwar.links;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.Partition;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Tablespace;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.connections.ClientVirtualConnection;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;


/**
 * Servlet implementation class TestGsonServlet
 */
// TODO : to be replaced by GetClientStatus
public class GetAllRelationsServlet extends GsonServlet<GetAllRelations, GetAllRelationsResponse> {
	private static final Logger log = Logger.getLogger(GetAllRelationsServlet.class);
	private static final long serialVersionUID = 1L;

	@Autowired
	private DatasourceManager datasourceManager;
	
	public GetAllRelationsServlet() {
        super(GetAllRelations.class);
    }
	
	

 
	@Override
	public GetAllRelationsResponse proceed(GetAllRelations request, Client connectedClient) throws Exception {
		
		GetAllRelationsResponse response = new GetAllRelationsResponse();
		
		try (MitsiConnection connection = datasourceManager.getConnection(request.datasourceName)) { 
			response.relations = connection.getAllRelations();
		}
		
		return response;
	}




}
