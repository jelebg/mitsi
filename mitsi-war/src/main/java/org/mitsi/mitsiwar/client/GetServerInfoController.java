package org.mitsi.mitsiwar.client;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.core.DatasourceManager;
import org.mitsi.mitsiwar.MitsiRestController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

final class GetServerInfo {
	
	public GetServerInfo() {
	}
}

final class GetServerInfoResponse {

	String warVersion;
	
	public GetServerInfoResponse() {
		
	}
}

@Controller
@RequestMapping("/getServerInfo")
public class GetServerInfoController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(GetServerInfoController.class);
 
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody GetServerInfoResponse proceed(@RequestBody GetServerInfo request) throws MitsiException {
	
		GetServerInfoResponse response = new GetServerInfoResponse();

		response.warVersion = DatasourceManager.class.getPackage().getImplementationVersion();
		
		return response;
	}

}
