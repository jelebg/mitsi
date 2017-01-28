angular.module('mitsiApp')
.service( 'sourceService', function(mitsiHttpService) {

	this.getObjects = function(datasource, schema, light) {
		return mitsiHttpService.postForDatasource(datasource, 'GetDatabaseObjectsServlet', { 
			"datasourceName" : datasource.name,
			"schema" : schema,
			"light" : light 
		});
	}

});