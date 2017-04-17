package org.mitsi.mitsiwar.data;

import java.sql.SQLException;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.mitsi.commons.MitsiException;
import org.mitsi.commons.pojos.Filter;

import org.apache.log4j.Logger;
import org.mitsi.commons.pojos.OrderByColumn;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.mitsiwar.MitsiRestController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

class GetData {
	String datasourceName;
	String owner;
	String objectName;
	String table;
	OrderByColumn[] orderByColumns;
	long fromRow;
	long count;
	Filter[] filters;
	
	public GetData() {
		// nothing
	}
}

class GetDataResponse {
	List<Column> columns;
	List<String[]> results;
	boolean maxRowsReached;
	
	public GetDataResponse() {
		// nothing
	}
}


@Controller
@RequestMapping("/getData")
public class GetDataController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(GetDataController.class);
 
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody GetDataResponse proceed(@RequestBody GetData request, HttpSession httpSession) throws MitsiException {
		GetDataResponse response = new GetDataResponse();

		try (MitsiConnection connection = getConnection(httpSession, request.datasourceName)) {
			long maxRows = connection.getMaxExportRows();
			long rowCount = request.count<=0||request.count>maxRows?maxRows:request.count;
			
			MitsiConnection.GetDataResult result = connection.getData(
					request.owner, request.objectName, 
					request.fromRow, rowCount, 
					request.orderByColumns, request.filters);
			
			response.columns = result.columns;
			response.results = result.results;
			response.maxRowsReached = response.results.size()==maxRows;
		}
		catch(SQLException e) {
			log.error("error in GetDataServlet", e);
			throw new MitsiException("error in GetDataServlet", e);
		}
		
		return response;
	}

}
