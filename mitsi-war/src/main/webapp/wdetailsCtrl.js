angular.module('mitsiApp')
    .controller('wdetailsCtrl', function($scope, $rootScope, detailsService, errorService) {

    $scope.detailsAccordions = [];
    	
    $scope.getTableDetails = function(source, databaseObject) {
    	detailsService.getDetails(source.name, "table", databaseObject.id.name, databaseObject.id.schema)
	    .then(function(response) {
	    	  $scope.detailsAccordions = response.data.accordions;
	    },
	    errorService.getGenericHttpErrorCallback());
    }
    	
    $scope.init = function() {
    	if($rootScope.currentSource && 
			$rootScope.currentSource.currentObject ) {
    		$scope.getTableDetails($rootScope.currentSource, $rootScope.currentSource.currentObject);
    	}
    }
    
	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED, function (event, source, databaseObject) {
		$scope.getTableDetails(source, databaseObject);
		
	});
    
	$scope.init();
});