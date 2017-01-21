angular.module('mitsiApp')
    .controller('loginCtrl', function($scope, $rootScope, $state, userService) {

    $scope.loggedUser = null;
	
	$scope.login = function() {
		if($scope.loggedUser) {
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
						$scope.loggedUser = { 
								// TODO
								username: $scope.loginUser.trim()
						}
					};
			    },
			    function(response) {
			    	// TODO : show error
			    	$scope.loggedUser = null;
			    }
			);
		}
		finally {
			$scope.loginPassword = null;
		}
	}
	
	$scope.logout = function() {
		userService.logout();
		$scope.loggedUser = null;
	}
	
	$scope.isUserLoggedIn = function() {
		return $scope.loggedUser != null;
	}


});