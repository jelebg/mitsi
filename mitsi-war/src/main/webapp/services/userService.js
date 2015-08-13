angular.module('mitsiApp')
.service( 'userService', function($http) {
	this.getClientStatus = function() {
		return $http.post('GetClientStatusServlet', { });
	}

	
});