package org.mitsi.mitsiwar.data;

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

import javax.servlet.http.HttpSession;
import java.sql.SQLException;
import java.util.List;

class RunSqlForTime {
	String datasourceName;
	String sqlText;
	String cancelSqlId;
	Integer timeout; // may be null

	public RunSqlForTime() {
		// nothing
	}
}

class RunSqlForTimeResponse {
	long nbRows;

	public RunSqlForTimeResponse() {
		// nothing
	}
}


@Controller
@RequestMapping("/runSqlForTime")
public class RunSqlForTimeController extends MitsiRestController {
	//TODO : TU
	private static final Logger log = Logger.getLogger(RunSqlController.class);
 
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody RunSqlForTimeResponse proceed(@RequestBody RunSqlForTime request, HttpSession httpSession) throws MitsiException {
		RunSqlForTimeResponse response = new RunSqlForTimeResponse();
		Client connectedClient = getClient(httpSession);

		try (MitsiConnection connection = getConnection(httpSession, request.datasourceName)) {
			response.nbRows = connection.runSqlForTime(
					request.sqlText, request.timeout,
					connectedClient.getCancelStatementManager(), request.cancelSqlId);
		}
		catch(SQLException e) {
			log.error("error in RunSqlForTimeController", e);
			throw new MitsiException("error in RunSqlForTimeController", e);
		}
		
		return response;
	}

}
