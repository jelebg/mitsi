angular.module('mitsiApp')
    .controller('wdetailsCtrl', function($scope, $rootScope, detailsService, errorService) {

    $scope.detailsAccordions = [];
    
    $scope.lastObjectType = null;
    $scope.accordionsOpeningSave = {};
    $scope.loading = false;
    
    $scope.saveAccordionsOpening = function() {
    	var objectType = $scope.lastObjectType;

    	if(!$scope.detailsAccordions) {
    		return;
    	}
    	if($scope.detailsAccordions.length == 0) {
    		return;
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
    	$scope.loading = true;
    	if(databaseObject) {
	    	detailsService.getDetails(source, "table", databaseObject.id.name, databaseObject.id.schema)
		    .then(function(response) {
		    	  $scope.saveAccordionsOpening();
		    	  $scope.detailsAccordions = response.data.accordions;
		    	  $scope.restoreAccordionsOpening("table");
		    },
		    errorService.getGenericHttpErrorCallback())
		    .finally(function() {
	    	   $scope.loading = false;
			});
    	}
    	else {
	    	detailsService.getDetails(source, null, null, null)
		    .then(function(response) {
		    	  $scope.saveAccordionsOpening();
		    	  $scope.detailsAccordions = response.data.accordions;
		    	  $scope.restoreAccordionsOpening("source");
		    },
		    errorService.getGenericHttpErrorCallback())
		    .finally(function() {
	    	   $scope.loading = false;
		    });
    	}
    }
    
    $scope.isRowExcludedByFilter = function(accordion, row) {
    	let filter = accordion.filter;
    	if(!filter) {
    		return false;
    	}
    	
		let filterSring = filter.trim().toLowerCase();

    	for(let i=0; i!=row.length; i++) {
    		let str = row[i];
    		if(!str) {
    			continue;
    		}
    		if(str.toLowerCase().indexOf(filter) !== -1) {
    			return false;
    		}
    	}
    	
    	return true;
    }
    
    $scope.selectTable = function(tableName) {
		let s = $rootScope.currentSource;
		let o = null;
		
		if(!s || !s.objects) {
			return;
		}
		
		for(let i=0; i!=s.objects.length; i++) {
			o = s.objects[i];
			if(o.id.schema+"."+o.id.name == tableName) {
				break;
			}
		}
		if(o == null) {
			return;
		}
		s.currentObject = o;
        $rootScope.$broadcast(EVENT_DATABASE_OBJECT_SELECTED, s, o); // NOSONAR EVENT_DATABASE_SELECTED does exist but sonar does not see it
    }
    
    $scope.refresh = function() {
    	$scope.init();
    }
    	
    $scope.init = function() {
    	if($rootScope.currentSource && 
			$rootScope.currentSource.currentObject ) {
    		$scope.getTableDetails($rootScope.currentSource, $rootScope.currentSource.currentObject);
    	}
    }
    
	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED, function (event, source, databaseObject) { // NOSONAR EVENT_DATABASE_SELECTED_FOR_DETAILS does exist
		$scope.getTableDetails(source, databaseObject);
	});
	
	$scope.$on(EVENT_DATABASE_SELECTED_FOR_DETAILS, function (event, source) { // NOSONAR EVENT_DATABASE_SELECTED_FOR_DETAILS does exist
		$scope.getTableDetails(source, null);
	});
    
	$scope.init();
});