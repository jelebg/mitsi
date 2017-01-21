package org.mitsi.mitsiwar.client;

import org.mitsi.mitsiwar.GsonServlet;
import org.mitsi.mitsiwar.authent.MitsiAuthenticator;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.beans.factory.annotation.Autowired;

public class LoginServlet extends GsonServlet<Login, LoginResponse> {
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
			// TODO : DECONNEXION
			System.out.println("logout");
		}
		else {
			// CONNEXION
			// TODO : log
			System.out.println("login:"+request.login+" pwd="+request.password);
			
			response.authenticationOK = mitsiAuthenticator.authenticate(request.login, request.password);
			// TODO : log
			System.out.println("response.authenticationOK:"+response.authenticationOK);
		}
		
		return response;
	}

}
