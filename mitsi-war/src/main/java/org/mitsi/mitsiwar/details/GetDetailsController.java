package org.mitsi.mitsiwar.details;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.datasources.DetailsSection;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.mitsiwar.MitsiRestController;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

class GetDetails {
	String datasourceName;
	String objectType;
	String objectName;
	String owner;
	
	public GetDetails() {
		// nothing
	}
}

class GetDetailsResponse {

	String message;
	List<DetailsSection> sections;
	
	public GetDetailsResponse() {
		// nothing
	}
}

@Controller
@RequestMapping("/getDetails")
public class GetDetailsController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(GetDetailsController.class);
	
	//// datasource details

	@SuppressWarnings("squid:S1166")
	private void getDatasource(GetDetailsResponse response, MitsiConnection connection, String datasourceName) throws MitsiException {
		
		List<DetailsSection> detailsSections = connection.getDetailsForDatasource();
		
		response.message = ""; // TODO ?
		response.sections = detailsSections;

	}
	
	@SuppressWarnings("squid:S1166")
	private void getTable(GetDetailsResponse response, MitsiConnection connection,
			String datasourceName, String owner, String tableName) throws MitsiException {
		
		List<DetailsSection> detailsSections = connection.getDetailsForTable(owner, tableName);
		
		response.message = ""; // TODO ?
		response.sections = detailsSections;
		
	}
	
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody GetDetailsResponse proceed(@RequestBody GetDetails request, HttpSession httpSession) throws MitsiException {
		GetDetailsResponse response = new GetDetailsResponse();
		
		try (MitsiConnection connection = getConnection(httpSession, request.datasourceName)) { // 
			if(StringUtils.isEmpty(request.objectName) || StringUtils.isEmpty(request.objectType) || StringUtils.isEmpty(request.owner)) {
				getDatasource(response, connection, request.datasourceName);
			}
			else {
				
				if("table".equals(request.objectType)) {
					getTable(response, connection, request.datasourceName, request.owner, request.objectName);
				}
				else {
					log.error("unknown object type : "+request.objectType);
				}
			}
		}
		
		
		return response;
	}
	

}
