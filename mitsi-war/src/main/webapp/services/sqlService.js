angular.module('mitsiApp')
.service( 'sqlService', function($http) {

	this.getData = function(datasourceName, owner, objectName, fromRow, count) {
		return $http.post('GetDataServlet', { 
			"datasourceName" : datasourceName,
			"owner"          : owner,
			"objectName"     : objectName,
			"fromRow"        : fromRow,
			"count"          : count
		});
	}

	
});