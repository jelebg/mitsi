package org.mitsi.mitsiwar.details;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class DetailsServlet
 */
public class DetailsJspServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public DetailsJspServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		request.setAttribute("datasource", request.getParameter("datasource"));
		request.setAttribute("objectType", request.getParameter("type"));
		request.setAttribute("objectName", request.getParameter("name"));
		request.setAttribute("owner", request.getParameter("owner"));
		getServletContext().getRequestDispatcher("/details.jsp").forward(request,response);
	}


}
