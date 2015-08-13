angular.module('mitsiApp')
    .controller('sourcesCtrl', function($scope) {

	$scope.mya = true;
	$scope.tutu = "sources";
	$scope.messources = [];
	for(var i=0; i!=100; i++) {
		$scope.messources.push( "source #"+i );
	}
	
	$scope.coucou = function() {
		alert("coucou");
	}
});