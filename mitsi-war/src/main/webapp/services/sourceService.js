angular.module('mitsiApp')
.service( 'sourceService', function($http) {

	this.getObjects = function(datasourceName, schema, light) {
		return $http.post('GetDatabaseObjectsServlet', { 
			"datasourceName" : datasourceName,
			"schema" : schema,
			"light" : light 
		});
	}

});