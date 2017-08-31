package org.mitsi.mitsiwar.data;

import java.sql.SQLException;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

class RunSql {
	String datasourceName;
	String sqlText;
	String cancelSqlId;
	Integer timeout; // may be null
	long   count;
	
	public RunSql() {
		// nothing
	}
}

class RunSqlResponse {
	List<Column> columns;
	List<String[]> results;
	boolean maxRowsReached;
	
	public RunSqlResponse() {
		// nothing
	}
}


@Controller
@RequestMapping("/runSql")
public class RunSqlController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(RunSqlController.class);
 
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody RunSqlResponse proceed(@RequestBody RunSql request, HttpSession httpSession) throws MitsiException {
		RunSqlResponse response = new RunSqlResponse();
		Client connectedClient = getClient(httpSession);

		try (MitsiConnection connection = getConnection(httpSession, request.datasourceName)) {
			long maxRows = connection.getMaxExportRows();
			long rowCount = request.count<=0||request.count>maxRows?maxRows:request.count;
			
			MitsiConnection.GetDataResult result = connection.runSql(
					request.sqlText, request.timeout, (int) rowCount+1,
					connectedClient.getCancelStatementManager(), request.cancelSqlId);
			
			response.columns = result.columns;
			response.results = result.results.subList(0, (int) rowCount);
			response.maxRowsReached = result.results.size()>rowCount;
		}
		catch(SQLException e) {
			log.error("error in RunSqlController", e);
			throw new MitsiException("error in RunSqlController", e);
		}
		
		return response;
	}

}
