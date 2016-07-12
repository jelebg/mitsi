angular.module('mitsiApp')
.service( 'sqlService', function($http) {
	/*this.beginSql = function(datasourceName, nbRowToFetch, sql) {
		return $http.post('RawSQLBeginServlet', { 
			"datasourceName" : datasourceName,
			"nbRowToFetch"   : nbRowToFetch,
			"sql"            : sql
		});
	}*/

	this.getData = function(datasourceName, owner, objectName, fromRow, count) {
		return $http.post('GetDataServlet', { 
			"datasourceName" : datasourceName,
			"owner"          : owner,
			"objectName"     : objectName,
			"fromRow"        : fromRow,
			"count"          : count
		});
	}

	/*this.fetch = function(datasourceName, nbRowToFetch) {
		return $http.post('RawSQLFetchServlet', {
				"datasourceName" : datasourceName,
				"nbRowToFetch"   : nbRowToFetch
		});
	}*/
	
});