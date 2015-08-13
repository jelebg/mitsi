angular.module('mitsiApp')
    .controller('workbenchtabsCtrl', function($scope) {

	$scope.mya = true;
	$scope.tutu = "bouh";
	
	$scope.coucou = function() {
		alert("coucou");
	}
});