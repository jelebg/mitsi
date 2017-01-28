angular.module('mitsiApp')
.service( 'mitsiHttpService', function($http, $q, errorService) {
	
	this.post = function(servletName, json) {
		var defer = $q.defer();
		
		$http.post(servletName, json)
		.then(function(response) {
				if(response.data.errorMessage) {
					errorService.showGeneralError(response.data.errorMessage);
					defer.reject(response.data.errorMessage);
				}
				else {
					defer.resolve(response);
				}
		   }
		   , function(error) {
		   	  errorService.showGeneralError("internal error");
			  defer.reject(error);
		   }
		);
		
		return defer.promise;
	}
	
	this.postForDatasource = function(datasource, servletName, json) {
		var defer = $q.defer();
		
		$http.post(servletName, json)
		.then(function(response) {
				if(response.data.errorMessage) {
					datasource.errorMessage = response.data.errorMessage;
					datasource.errorDetails = response.data.errorMessage;
					defer.reject(response.data.errorMessage);
				}
				else {
					defer.resolve(response);
				}
			}
		   , function(error) {
		   	  errorService.showGeneralError("internal error");
			  defer.reject(error);
		   }
		);
		
		return defer.promise;
	}


});