package org.mitsi.mitsiwar.client;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.mitsiwar.authent.MitsiAuthenticator;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@SuppressWarnings("squid:S1700")
class Login {
	String login;
	String password;
	
	public Login() {
		// nothing
	}
}

@SuppressWarnings("squid:ClassVariableVisibilityCheck")
class LoginResponse {
	public boolean authenticationOK;

	public LoginResponse() {
		// nothing
	}
}

@Controller
@RequestMapping("/login")
@SuppressWarnings("squid:S2226")
public class LoginController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(LoginController.class);

	@Autowired
	MitsiAuthenticator mitsiAuthenticator;
	
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody LoginResponse proceed(@RequestBody Login request, HttpSession httpSession) throws MitsiException {
		
		LoginResponse response = new LoginResponse();
		Client connectedClient = getClient(httpSession);
		
		if(request.login == null || request.login.isEmpty()) {
			log.info("logout:"+connectedClient.getConnectedUsername());
			connectedClient.logout();
		}
		else {
			response.authenticationOK = mitsiAuthenticator.authenticate(request.login, request.password);
			if(response.authenticationOK) {
				connectedClient.login(request.login);
			}
			else {
				connectedClient.logout();
			}
			log.info("request.login:"+request.login+" response.authenticationOK:"+response.authenticationOK);
		}
		
		return response;
	}

}
