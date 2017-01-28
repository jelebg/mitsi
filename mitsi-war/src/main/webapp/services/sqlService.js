angular.module('mitsiApp')
.service( 'sqlService', function(mitsiHttpService) {

	this.getData = function(datasourceName, owner, objectName, fromRow, count) {
		return mitsiHttpService.post('GetDataServlet', { 
			"datasourceName" : datasourceName,
			"owner"          : owner,
			"objectName"     : objectName,
			"fromRow"        : fromRow,
			"count"          : count
		});
	}

	
});