angular.module('mitsiApp')
    .controller('wsqlCtrl', function($scope) {

	$scope.mya = true;
	$scope.tutu = "wsql";
	
	$scope.coucou = function() {
		alert("coucou");
	}
});