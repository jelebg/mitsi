package org.mitsi.mitsiwar;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.mitsi.datasources.MitsiConnection;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.exception.MitsiWarException;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import com.google.gson.Gson;
import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;

public abstract class GsonServlet<Request, Response> extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	public static final String CONNECTED_CLIENTSESSION_ATTRIBUTE = "MITSI_CONNECTED_CLIENT";

	Class<Request> requestClass;
	public GsonServlet(Class<Request> requestClass) {
		this.requestClass = requestClass;
	}
	
	public abstract Response proceed(Request request, Client client, List<MitsiConnection> usingConnections) throws Exception;
	
	@Override
	public void init() throws ServletException {
		super.init();
	    SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader in = request.getReader();
		PrintWriter out = response.getWriter();
		Client connectedClient = (Client) request.getSession().getAttribute(CONNECTED_CLIENTSESSION_ATTRIBUTE);
		if(connectedClient == null) {
			connectedClient = new Client(null); // null forcement car on ne peut pas être déjà connecté ?
			request.getSession().setAttribute(CONNECTED_CLIENTSESSION_ATTRIBUTE, connectedClient);
		}
		
		List<MitsiConnection> usingConnections = new ArrayList<>();
		
		response.setContentType("application/json; charset=UTF-8");
		Gson gson = new Gson();
		try {
			
			Request gsonRequest = gson.fromJson(in, requestClass);
			Response gsonResponse = proceed(gsonRequest, connectedClient, usingConnections);
			gson.toJson(gsonResponse, out);
			
		} 
		catch(MitsiWarException e){
			throw new ServletException("MitsiWarException", e);
		} 
		catch(JsonSyntaxException|JsonIOException e){
			throw new ServletException("JSON decoding error", e);
		} 
		catch(Exception e){
			throw new ServletException("Unexpected Exception", e);
		}
		finally {
			for(MitsiConnection mitsiConnection : usingConnections) {
				mitsiConnection.rollback();
			}
		}
		
	
	}
	
	
	
}
