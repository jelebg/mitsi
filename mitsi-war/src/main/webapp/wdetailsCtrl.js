angular.module('mitsiApp')
    .controller('wdetailsCtrl', function($scope) {

	$scope.mya = true;
	$scope.tutu = "wdetails";
	
	$scope.coucou = function() {
		alert("coucou");
	}
});