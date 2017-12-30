package org.mitsi.mitsiwar.client;

import org.apache.log4j.Logger;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.mitsiwar.common.Datasource;
import org.mitsi.rules.Rule;
import org.mitsi.users.MitsiRulesConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

class GetRules {
	public GetRules() {
	}
}

class GetRulesResponse {
	List<Rule> rules;

	public GetRulesResponse() {
	}
}


@Controller
@RequestMapping("/getRules")
public class GetRulesController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(GetRulesController.class);

	@Autowired
	protected MitsiRulesConfig mitsiRulesConfig; //NOSONAR

	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody Response proceed(@RequestBody Request request, HttpSession httpSession) throws Exception {
	
		Response response = new Response();

		// TODO : no authent needed to get rules ?

		response.rules = mitsiRulesConfig.getRules();

		return response;
	}
	

}
