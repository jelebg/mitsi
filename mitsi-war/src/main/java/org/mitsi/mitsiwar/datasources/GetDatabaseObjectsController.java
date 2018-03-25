package org.mitsi.mitsiwar.datasources;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.api.datasources.DatabaseObject;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.api.datasources.Schema;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.mitsiwar.exception.MitsiWarException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

class GetDatabaseObjects {
	String datasourceName;
	String schema;
	
	public GetDatabaseObjects() {
	}
}

class GetDatabaseObjectsResponse {
	List<DatabaseObject> databaseObjects;
	List<Schema> schemas;
	String provider;
	String datasourceName;

	public GetDatabaseObjectsResponse() {}
}

@Controller
@RequestMapping("/getDatabaseObjects")
public class GetDatabaseObjectsController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(GetDatabaseObjectsController.class);

	@RequestMapping(value="", method = RequestMethod.POST)
	public  @ResponseBody GetDatabaseObjectsResponse proceed(@RequestBody GetDatabaseObjects request, HttpSession httpSession) throws MitsiException {
		GetDatabaseObjectsResponse response = new GetDatabaseObjectsResponse();

		try (MitsiConnection connection = getConnection(httpSession, request.datasourceName)) {
			
			String schema = request.schema;
			response.schemas = connection.getAllSchemas(schema);
			if(schema != null) {
				for(Schema s : response.schemas) {
					s.current = schema.equals(s.name);
				}
			}
			
			response.databaseObjects = connection.getTablesAndViews(schema);
			response.provider = connection.getProviderName();
			response.datasourceName = request.datasourceName;

		} 
		catch(Exception e) {
			log.error("could not connect to database : "+request.datasourceName, e);
			throw new MitsiWarException("could not connect to database : "+request.datasourceName, e);
		}

		return response;
	}
	
}
