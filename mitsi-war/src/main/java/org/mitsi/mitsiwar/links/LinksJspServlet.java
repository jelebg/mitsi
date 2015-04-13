package org.mitsi.mitsiwar.links;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class LinksJspServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
    public LinksJspServlet() {
        super();
    }
    
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		request.setAttribute("datasource", request.getParameter("datasource"));
		request.setAttribute("objectType", request.getParameter("type"));
		request.setAttribute("objectName", request.getParameter("name"));
		request.setAttribute("owner", request.getParameter("owner"));
		getServletContext().getRequestDispatcher("/links.jsp").forward(request,response);
	}

}
