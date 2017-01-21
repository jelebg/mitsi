angular.module('mitsiApp')
.service( 'userService', function($http) {
	this.getClientStatus = function() {
		return $http.post('GetClientStatusServlet', { });
	}

	this.login = function(loginUser, loginPassword) {
		return $http.post('LoginServlet', { "login":loginUser, "password":loginPassword });
	}
	
	this.logout = function() {
		$http.post('LoginServlet', { "login":null, "password":null });
	}
});