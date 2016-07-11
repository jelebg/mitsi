angular.module('mitsiApp')
.service( 'detailsService', function($http) {
	this.getDetails = function(datasourceName, objectType, objectName, owner) {
		return $http.post('GetDetailsServlet', { 
			"datasourceName":datasourceName,
			"objectType":objectType,
			"objectName":objectName,
			"owner":owner
		});
	}

	
});