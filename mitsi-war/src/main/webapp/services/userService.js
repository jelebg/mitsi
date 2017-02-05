angular.module('mitsiApp')
.service( 'userService', function(mitsiHttpService) {
	this.getClientStatus = function() {
		return mitsiHttpService.post('GetClientStatusServlet', { });
	}

	this.login = function(loginUser, loginPassword) {
		return mitsiHttpService.post('LoginServlet', { "login":loginUser, "password":loginPassword });
	}
	
	this.logout = function() {
		return mitsiHttpService.post('LoginServlet', { "login":null, "password":null });
	}
	
	this.getServerInfo = function() {
		return mitsiHttpService.post('GetServerInfoServlet', { });

	}
});