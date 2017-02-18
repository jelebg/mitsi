angular.module('mitsiApp')
    .controller('wdetailsCtrl', function($scope, $rootScope, detailsService, errorService) {

    $scope.detailsAccordions = [];
    
    $scope.lastObjectType = null;
    $scope.accordionsOpeningSave = {};
    
    $scope.saveAccordionsOpening = function() {
    	var objectType = $scope.lastObjectType;

    	if(!$scope.detailsAccordions) {
    		return;
    	}
    	if($scope.detailsAccordions.length == 0) {
    		return
    	}
    	
    	var save = [];
    	for(var i=0; i!=$scope.detailsAccordions.length; i++) {
    		save.push($scope.detailsAccordions[i].isOpen);
    	}
    	$scope.accordionsOpeningSave[objectType] = save;
    }
    	
    $scope.restoreAccordionsOpening = function(objectType) {
    	$scope.lastObjectType = objectType;
    	if(!$scope.detailsAccordions) {
    		return;
    	}

    	var save = $scope.accordionsOpeningSave[objectType];
    	for(var i=0; i!=$scope.detailsAccordions.length; i++) {
    		var isOpen = false;
    		if(save && save.length > i) {
    			isOpen = save[i];
    		}
    		
    		$scope.detailsAccordions[i].isOpen = isOpen;
    	}
    }

    $scope.getTableDetails = function(source, databaseObject) {
    	if(databaseObject) {
	    	detailsService.getDetails(source, "table", databaseObject.id.name, databaseObject.id.schema)
		    .then(function(response) {
		    	  $scope.saveAccordionsOpening();
		    	  $scope.detailsAccordions = response.data.accordions;
		    	  $scope.restoreAccordionsOpening("table");
		    },
		    errorService.getGenericHttpErrorCallback());
    	}
    	else {
	    	detailsService.getDetails(source, null, null, null)
		    .then(function(response) {
		    	  $scope.saveAccordionsOpening();
		    	  $scope.detailsAccordions = response.data.accordions;
		    	  $scope.restoreAccordionsOpening("source");
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