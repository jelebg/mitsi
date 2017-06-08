angular.module('mitsiApp')
    .controller('wdetailsCtrl', function($scope, $rootScope, detailsService, errorService) {

    $scope.detailsSections = [];
    
    $scope.lastObjectType = null;
    $scope.sectionsOpeningSave = {};
    $scope.loading = false;
    
    $scope.capitalizeFirstLetter = function (str) {
    	return capitalizeFirstLetter(str);
    }
    
    $scope.saveSectionsOpening = function() {
    	var objectType = $scope.lastObjectType;

    	if(!$scope.detailsSections) {
    		return;
    	}
    	if($scope.detailsSections.length == 0) {
    		return;
    	}
    	
    	var save = [];
    	for(var i=0; i!=$scope.detailsSections.length; i++) {
    		save.push($scope.detailsSections[i].isOpen);
    	}
    	$scope.sectionsOpeningSave[objectType] = save;
    }
    	
    $scope.restoreSectionsOpening = function(objectType) {
    	$scope.lastObjectType = objectType;
    	if(!$scope.detailsSections) {
    		return;
    	}

    	var save = $scope.sectionsOpeningSave[objectType];
    	for(var i=0; i!=$scope.detailsSections.length; i++) {
    		var isOpen = false;
    		if(save && save.length > i) {
    			isOpen = save[i];
    		}
    		
    		$scope.detailsSections[i].isOpen = isOpen;
    	}
    }

    $scope.getTableDetails = function(source, databaseObject) {
    	$scope.loading = true;
    	if(databaseObject) {
	    	detailsService.getDetails(source, "table", databaseObject.id.name, databaseObject.id.schema)
		    .then(function(response) {
		    	  $scope.saveSectionsOpening();
		    	  $scope.detailsSections = response.data.sections;
		    	  $scope.restoreSectionsOpening("table");
		    },
		    errorService.getGenericHttpErrorCallback())
		    .finally(function() {
	    	   $scope.loading = false;
			});
    	}
    	else {
	    	detailsService.getDetails(source, null, null, null)
		    .then(function(response) {
		    	  $scope.saveSectionsOpening();
		    	  $scope.detailsSections = response.data.sections;
		    	  $scope.restoreSectionsOpening("source");
		    },
		    errorService.getGenericHttpErrorCallback())
		    .finally(function() {
	    	   $scope.loading = false;
		    });
    	}
    }
    
    $scope.isRowExcludedByFilter = function(detailsSection, row) {
    	let filter = detailsSection.filter;
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