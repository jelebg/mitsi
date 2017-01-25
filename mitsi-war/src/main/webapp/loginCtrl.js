angular.module('mitsiApp')
    .controller('loginCtrl', function($scope, $rootScope, $state, userService) {

    $rootScope.loggedUser = null;
	
    $scope.loginOnEnter = function(e) {
    	if(e.code == "Enter") {
    		$scope.login();
    	}
    }

    $scope.loginOnSpacebar = function(e) {
    	if(e.code == "Space") {
    		$scope.login();
    	}
    }
    
    $scope.logoutOnSpacebar = function(e) {
    	if(e.code == "Space") {
    		$scope.logout();
    	}
    }
    
	$scope.login = function() {
		if($rootScope.loggedUser) {
			return;
		}
		if(!$scope.loginUser) {
			return;
		}
		if(!$scope.loginPassword) {
			return;
		}
		if($scope.loginUser.trim()=="" || $scope.loginPassword=="") {
			return;
		}
		try {
			userService.login($scope.loginUser.trim(), $scope.loginPassword)
				.then(function(response) {
					if(!response.data.authenticationOK) {
						console.log("not authenticated");
						// TODO : show error
					}
					else {
						$rootScope.loggedUser = { 
								// TODO
								username: $scope.loginUser.trim()
						}
				        $rootScope.$broadcast(EVENT_LOGIN_LOGOUT);
					};
			    },
			    function(response) {
			    	// TODO : show error
			    	$rootScope.loggedUser = null;
			    }
			);
		}
		finally {
			$scope.loginPassword = null;
		}
	}
	
	$scope.logout = function() {
		userService.logout();
		$rootScope.loggedUser = null;
        $rootScope.$broadcast(EVENT_LOGIN_LOGOUT);
	}
	
	$scope.isUserLoggedIn = function() {
		return $rootScope.loggedUser != null;
	}


});