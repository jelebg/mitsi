angular.module('mitsiApp')
    .controller('workbenchtabsCtrl', function($scope, $state) {

	$scope.mya = true;
	$scope.tutu = "bouh";
	
	$scope.coucou = function() {
		alert("coucou");
	}
	
});