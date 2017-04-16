package org.mitsi.mitsiwar.datasources;

import java.util.ArrayList;
import java.util.List;
import java.util.SortedSet;

import javax.servlet.http.HttpSession;

import org.mitsi.commons.MitsiException;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.mitsiwar.common.Datasource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

class GetDatasources {
	String datasource; // maybe null
	
	public GetDatasources() {
	}
}

class GetDatasourcesResponse {

	List<Datasource> datasources = new ArrayList<>();
	
	public GetDatasourcesResponse() {}
}

// TODO : unused, delete the controller ?
@Controller
@RequestMapping("/getDatasources") 
public class GetDatasourcesController extends MitsiRestController {

 
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody GetDatasourcesResponse proceed(@RequestBody GetDatasources request, HttpSession httpSession) throws MitsiException {
		
		GetDatasourcesResponse response = new GetDatasourcesResponse();
		
		for(MitsiDatasource mitsiDatasources : getDatasources(httpSession)) {
			Datasource datasource = new Datasource();
			datasource.name = mitsiDatasources.getName();
			datasource.description = mitsiDatasources.getDescription();
			datasource.tags = mitsiDatasources.getTags();
			response.datasources.add(datasource);
		}
		
		return response;
	}

}
