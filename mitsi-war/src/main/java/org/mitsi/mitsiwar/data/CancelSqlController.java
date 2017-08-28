package org.mitsi.mitsiwar.data;

import java.sql.SQLException;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.mitsiwar.connections.Client;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

class CancelSql {
	String cancelSqlId;
	// use session Id to identify client
	
	public CancelSql() {
		// nothing
	}
}

class CancelSqlResponse {
	
	public CancelSqlResponse() {
		// nothing
	}
}


@Controller
@RequestMapping("/cancelSql")
public class CancelSqlController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(CancelSqlController.class);
 
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody CancelSqlResponse proceed(@RequestBody CancelSql request, HttpSession httpSession) throws MitsiException {
		CancelSqlResponse response = new CancelSqlResponse();
		Client connectedClient = getClient(httpSession);

		if (request.cancelSqlId == null) {
			// cancel all running sql
			List<String> datasourcesNames = connectedClient.getCancelStatementManager().getAllDatasourcesWithStatements();
			for (String datasourceName : datasourcesNames) {
				try (MitsiConnection connection = getConnection(httpSession, datasourceName)) {
					connection.cancelAllRunningSql(connectedClient.getCancelStatementManager());
				}
				catch(SQLException e) {
					log.error("error in CancelSqlController", e);
					throw new MitsiException("error in CancelSqlController", e);
				}
			}
		}
		else {
			// Cancel only one running sql
			String datasourceName = connectedClient.getCancelStatementManager().getDatasourceBySqlId(request.cancelSqlId);
			try (MitsiConnection connection = getConnection(httpSession, datasourceName)) {
				connection.cancelRunningSql(connectedClient.getCancelStatementManager(), request.cancelSqlId);
			}
			catch(SQLException e) {
				log.error("error in CancelSqlController", e);
				throw new MitsiException("error in CancelSqlController", e);
			}
		}
		
		return response;
	}

}
