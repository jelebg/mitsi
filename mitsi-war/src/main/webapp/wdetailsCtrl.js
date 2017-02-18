angular.module('mitsiApp')
    .controller('wdetailsCtrl', function($scope, $rootScope, detailsService, errorService) {

    $scope.detailsAccordions = [];
    	
    $scope.getTableDetails = function(source, databaseObject) {
    	if(databaseObject) {
	    	detailsService.getDetails(source, "table", databaseObject.id.name, databaseObject.id.schema)
		    .then(function(response) {
		    	  $scope.detailsAccordions = response.data.accordions;
		    },
		    errorService.getGenericHttpErrorCallback());
    	}
    	else {
	    	detailsService.getDetails(source, null, null, null)
		    .then(function(response) {
		    	  $scope.detailsAccordions = response.data.accordions;
		    },
		    errorService.getGenericHttpErrorCallback());
    	}
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
	
	$scope.$on(EVENT_DATABASE_SELECTED_FOR_DETAILS, function (event, source) {
		$scope.getTableDetails(source, null);
	});
    
	$scope.init();
});