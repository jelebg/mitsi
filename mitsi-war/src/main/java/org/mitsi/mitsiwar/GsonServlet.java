package org.mitsi.mitsiwar;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.users.MitsiDatasources;
import org.mitsi.users.MitsiUsersConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import com.google.gson.Gson;
import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;

public abstract class GsonServlet<Request, Response> extends HttpServlet {
	private static final Logger log = Logger.getLogger(GsonServlet.class);
	private static final long serialVersionUID = 1L;
	
	public static final String CONNECTED_CLIENTSESSION_ATTRIBUTE = "MITSI_CONNECTED_CLIENT";

	@Autowired
	protected transient MitsiDatasources mitsiDatasources; //NOSONAR should not inject inside a servlet TODO : rework needed 
	@Autowired
	protected transient MitsiUsersConfig mitsiUsersConfig; //NOSONAR should not inject inside a servlet TODO : rework needed

	final Class<Request> requestClass;
	public GsonServlet(Class<Request> requestClass) {
		this.requestClass = requestClass;
	}
	
	public abstract Response proceed(Request request, Client client) throws MitsiException;
	
	@Override
	public void init() throws ServletException {
		super.init();
	    SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
	}
	
	@Override
	@java.lang.SuppressWarnings("squid:S1181") // catching throwable is bas usualy but here I can aford to continue with the old configuration 
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		try {
			mitsiDatasources.loadIfNeccessary();
		} 
		catch(Throwable t) { 
			log.error("exception while loading datasources", t);
		}
		try {
			mitsiUsersConfig.loadIfNeccessary();
		} 
		catch(Throwable t) { 
			log.error("exception while loading users config", t);
		}
		

		BufferedReader in = request.getReader();
		PrintWriter out = response.getWriter();
		Client connectedClient = (Client) request.getSession().getAttribute(CONNECTED_CLIENTSESSION_ATTRIBUTE);
		if(connectedClient == null) {
			connectedClient = new Client(); 
			request.getSession().setAttribute(CONNECTED_CLIENTSESSION_ATTRIBUTE, connectedClient);
		}
		
		response.setContentType("application/json; charset=UTF-8");
		Gson gson = new Gson();
		try {
			Request gsonRequest = gson.fromJson(in, requestClass);
			Response gsonResponse = proceed(gsonRequest, connectedClient);
			gson.toJson(gsonResponse, out);

		} 
		catch(MitsiException e){
			log.info("generic error handling in GsonServlet", e );
			GsonResponse gsonResponse = new GsonResponse();
			gsonResponse.errorMessage = e.getMessage();
			gson.toJson(gsonResponse, out);
		} 
		catch(JsonSyntaxException|JsonIOException e){
			throw new ServletException("JSON decoding error", e);
		} 
		catch(Exception e){
			throw new ServletException("Unexpected Exception", e);
		}

	
	}
	
}
