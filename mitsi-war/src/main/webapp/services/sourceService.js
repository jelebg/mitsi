angular.module('mitsiApp')
.service( 'sourceService', function($http) {
	this.connectDatasource = function(datasourceName) {
		return $http.post('ConnectServlet', { "datasourceName" : datasourceName });
	}

	this.disconnectDatasource = function(datasourceName) {
		return $http.post('DisconnectServlet', { "datasourceName" : datasourceName });
	}
	
	this.getObjects = function(datasourceName, schema) {
		return $http.post('GetDatabaseObjectsServlet', { 
			"datasourceName" : datasourceName,
			"schema" : schema,
			"disableCaching" : true
		});
	}

});