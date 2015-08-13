angular.module('mitsiApp')
    .controller('sourcesCtrl', function($scope, $http, userService) {

	$scope.mya = true;
	$scope.tutu = "sources";
	$scope.datasources = [];

	
	$scope.init = function() {
		userService.getClientStatus()
		  .then(function(response) {
			  $scope.datasources = response.data.datasources;
		  }, function(errorMessage) {
		      // called asynchronously if an error occurs
		      // or server returns response with an error status.
			  console.warn( errorMessage );
			  alert( errorMessage );
		  });
	};

	$scope.init();

});