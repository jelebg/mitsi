angular.module('mitsiApp')
    .controller('wdetailsCtrl', function($scope, $rootScope, detailsService) {

    $scope.detailsAccordions = [];
    	
    $scope.getTableDetails = function(source, databaseObject) {
    	detailsService.getDetails(source.name, "table", databaseObject.id.name, databaseObject.id.schema)
	    .then(function(response) {
	    	  $scope.detailsAccordions = response.data.accordions;
			  //console.log(JSON.stringify(response.data, null, 2));
	    }, function(errorMessage) {
			  console.warn( errorMessage );
     		  alert( errorMessage );
		});
    }
    	
    $scope.init = function() {
    	if($rootScope.currentSource && 
			$rootScope.currentSource.currentObject ) {
    		$scope.getTableDetails($rootScope.currentSource, $rootScope.currentSource.currentObject);
    	}
    }
    
	$scope.$on('DabaseObjectSelected', function (event, source, databaseObject) {
		$scope.getTableDetails(source, databaseObject);
		
	});
    
	$scope.init();
});