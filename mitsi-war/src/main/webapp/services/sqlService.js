angular.module('mitsiApp')
.service( 'sqlService', function($http) {
	this.beginSql = function(datasourceName, nbRowToFetch, sql) {
		return $http.post('RawSQLBeginServlet', { 
			"datasourceName" : datasourceName,
			"nbRowToFetch"   : nbRowToFetch,
			"sql"            : sql
		});
	}

	this.beginTable = function(datasourceName, nbRowToFetch, owner, objectName) {
		return $http.post('RawSQLBeginServlet', { 
			"datasourceName" : datasourceName,
			"nbRowToFetch"   : nbRowToFetch,
			"sql"            : "select * from "+owner+"."+objectName
		});
	}

	this.fetch = function(datasourceName, nbRowToFetch) {
		return $http.post('RawSQLFetchServlet', {
				"datasourceName" : datasourceName,
				"nbRowToFetch"   : nbRowToFetch
		});
	}
	
});