angular.module('mitsiApp')
.service( 'sourceService', function(mitsiHttpService) {

	this.getObjects = function(datasource, schema) {
		return mitsiHttpService.postForDatasource(datasource, 'rest/getDatabaseObjects', { 
			"datasourceName" : datasource.name,
			"schema" : schema
		});
	}

});