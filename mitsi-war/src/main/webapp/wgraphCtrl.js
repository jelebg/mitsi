angular.module('mitsiApp')
    .controller('wgraphCtrl', function($scope) {

	$scope.mya = true;
	$scope.tutu = "wgraph";
	
	$scope.coucou = function() {
		alert("coucou");
	}
});