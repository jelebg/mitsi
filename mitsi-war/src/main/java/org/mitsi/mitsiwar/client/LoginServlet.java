package org.mitsi.mitsiwar.client;

import org.apache.log4j.Logger;
import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.authent.MitsiAuthenticator;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.beans.factory.annotation.Autowired;

public class LoginServlet extends GsonServlet<Login, LoginResponse> {
	private static final Logger log = Logger.getLogger(LoginServlet.class);
	private static final long serialVersionUID = 1L;


	@Autowired
	MitsiAuthenticator mitsiAuthenticator;
	
	public LoginServlet() {
        super(Login.class);
    }

 
	@Override
	public LoginResponse proceed(Login request, Client connectedClient) throws Exception {
		
		LoginResponse response = new LoginResponse();
		
		if(request.login == null || request.login.isEmpty()) {
			connectedClient.logout();
			System.out.println("logout");
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
