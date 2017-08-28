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
					if(!datasource.accordionOpened) {
						datasource.accordionOpened = true;
					}
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
	
	this.postForSql = function(sqlEntry, servletName, canceler, json) {
		var defer = $q.defer();
		
		let options = canceler ? {"timeout": canceler.promise} : null;
		
		$http.post(servletName, json, options)
		.then(function(response) {
				if(response.data.errorMessage) {
					if (sqlEntry) {
						sqlEntry.error = response.data.errorMessage;
					}
					else {
						errorService.showGeneralError(response.data.errorMessage);
					}
					defer.reject(response.data.errorMessage);
				}
				else {
					if (sqlEntry) {
						if (sqlEntry.cancelled) {
							sqlEntry.error = "Request cancelled"
						}
						else {
							sqlEntry.error = null;
						}
					}
					defer.resolve(response);
				}
			}
		   , function(error) {
				if (sqlEntry) {
					if (sqlEntry.cancelled) {
						sqlEntry.error = "Request cancelled";
					}
					else {
						sqlEntry.error = response.data.errorMessage;
					}
				}
			    defer.reject(error);
		   }
		);
		
		return defer.promise;
	}


});