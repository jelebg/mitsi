package org.mitsi.mitsiwar.client;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.MitsiLayer;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.mitsiwar.common.Layer;
import org.mitsi.rules.Rule;
import org.mitsi.users.MitsiRulesConfig;
import org.springframework.beans.factory.annotation.Autowired;
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
	List<Rule> rules;
	List<Layer> layers;

	public Response() {
	}
}


@Controller
@RequestMapping("/getClientStatus")
public class GetClientStatusController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(GetClientStatusController.class);

	@Autowired
	protected MitsiRulesConfig mitsiRulesConfig; //NOSONAR

	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody Response proceed(@RequestBody Request request, HttpSession httpSession) throws Exception {
	
		Response response = new Response();

		response.connectedUsername = getConnectedUsername(httpSession);
		response.datasources = null;
		response.layers = null;
		if(request.btwGetDatasources) {

			response.datasources = new ArrayList<>();
			response.layers = new ArrayList<>();
			DatasourcesAndLayers datasourcesAndLayers = getDatasourcesAndLayers(httpSession);

			for(MitsiDatasource mitsiDatasource : datasourcesAndLayers.datasources) {
				Datasource datasource = new Datasource();
				datasource.name = mitsiDatasource.getName();
				datasource.description = mitsiDatasource.getDescription();
				datasource.tags = mitsiDatasource.getTags();
				response.datasources.add(datasource);
			}

			for(MitsiLayer mitsiLayer : datasourcesAndLayers.layers) {
				Layer layer = new Layer();
				layer.name = mitsiLayer.getName();
				layer.description = mitsiLayer.getDescription();
				layer.tags = mitsiLayer.getTags();
				layer.datasources = mitsiLayer.getDatasources();
				response.layers.add(layer);
			}

			response.rules = mitsiRulesConfig.getRules();
		}
		
		return response;
	}
	

}
