package org.mitsi.mitsiwar.client;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.mitsiwar.common.Datasource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

class Request {
	boolean btwGetDatasources;
	
	public Request() {
	}
}

class Response {

	String connectedUsername;
	List<Datasource> datasources;
	
	public Response() {
	}
}


@Controller
@RequestMapping("/getClientStatus")
public class GetClientStatusController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(GetClientStatusController.class);
	
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody Response proceed(@RequestBody Request request, HttpSession httpSession) throws Exception {
	
		Response response = new Response();

		response.connectedUsername = getConnectedUsername(httpSession);
		response.datasources = null;
		if(request.btwGetDatasources) {
			response.datasources = new ArrayList<>();
			List<MitsiDatasource> mitsiDatasourceList = getDatasources(httpSession);
			
			for(MitsiDatasource mitsiDatasource : mitsiDatasourceList) {
				
				Datasource datasource = new Datasource();
				datasource.name = mitsiDatasource.getName();
				datasource.description = mitsiDatasource.getDescription();
				datasource.tags = mitsiDatasource.getTags();
				response.datasources.add(datasource);
			}
		}
		
		return response;
	}
	

}
