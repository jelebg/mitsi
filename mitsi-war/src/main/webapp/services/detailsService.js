angular.module('mitsiApp')
.service( 'detailsService', function(mitsiHttpService) {
	this.getDetails = function(datasource, objectType, objectName, owner) {
		return mitsiHttpService.postForDatasource(datasource, 'GetDetailsServlet', { 
			"datasourceName":datasource.name,
			"objectType":objectType,
			"objectName":objectName,
			"owner":owner
		});
	}

	
});