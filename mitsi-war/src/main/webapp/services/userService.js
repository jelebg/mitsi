angular.module('mitsiApp')
.service( 'userService', function(mitsiHttpService) {
	this.getClientStatus = function() {
		return mitsiHttpService.post('rest/getClientStatus', { "btwGetDatasources":true });
	}

	this.keepAlive = function() {
		return mitsiHttpService.post('rest/getClientStatus', { "btwGetDatasources":false });
	}

	this.getRules = function() {
		return mitsiHttpService.post('rest/getRules', {  });
	}

	this.login = function(loginUser, loginPassword) {
		return mitsiHttpService.post('rest/login', { "login":loginUser, "password":loginPassword });
	}
	
	this.logout = function() {
		return mitsiHttpService.post('rest/login', { "login":null, "password":null });
	}
	
	this.getServerInfo = function() {
		return mitsiHttpService.post('rest/getServerInfo', { });
	}
});