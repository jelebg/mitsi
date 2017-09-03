package org.mitsi.mitsiwar.data;

import org.apache.log4j.Logger;
import org.mitsi.commons.MitsiException;
import org.mitsi.mitsiwar.MitsiRestController;
import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.mitsiwar.connections.ClientCancellableStatementsManager;
import org.mitsi.mitsiwar.connections.SqlIdStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpSession;
import java.util.List;

class SqlStatus {

	public SqlStatus() {
		// nothing
	}
}

class SqlStatusResponse {
	List<SqlIdStatus> statusList;

	public SqlStatusResponse() {
		// nothing
	}
}


@Controller
@RequestMapping("/sqlStatus")
public class SqlStatusController extends MitsiRestController {
	private static final Logger log = Logger.getLogger(SqlStatusController.class);
 
	@RequestMapping(value="", method = RequestMethod.POST)
	public @ResponseBody SqlStatusResponse proceed(@RequestBody SqlStatus request, HttpSession httpSession) throws MitsiException {
		SqlStatusResponse response = new SqlStatusResponse();
		Client connectedClient = getClient(httpSession);

		ClientCancellableStatementsManager manager = connectedClient.getCancelStatementManager();
		response.statusList = manager.getCancelableSqls();

		return response;
	}

}
