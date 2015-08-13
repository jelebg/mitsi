angular.module('mitsiApp')
    .controller('wdataCtrl', function($scope) {

	$scope.mya = true;
	$scope.tutu = "wdata";
	
	$scope.coucou = function() {
		alert("coucou");
	}
});