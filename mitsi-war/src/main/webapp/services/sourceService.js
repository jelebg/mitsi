angular.module('mitsiApp')
.service( 'sourceService', function($http) {

	this.getObjects = function(datasourceName, schema) {
		return $http.post('GetDatabaseObjectsServlet', { 
			"datasourceName" : datasourceName,
			"schema" : schema,
			"disableCaching" : true // TODO : a supprimer
		});
	}

});