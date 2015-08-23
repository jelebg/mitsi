angular.module('mitsiApp')
    .controller('wdataCtrl', function($scope) {

	$scope.tutu = "wdata";

	
	$scope.mesdatas = [
	                   {"col1":"tutu", "col2":"tata", "col3":"toto"},
	                   {"col1":"abc", "col2":"def", "col3":"ghi"}
	];
	
	for(var i=0; i!=100; i++) {
		$scope.mesdatas.push({ "col1":""+i, "col2":""+i, "col3":""+i })
		
	}
});