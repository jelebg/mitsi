angular.module('mitsiApp')
    .controller('wdetailsCtrl', function($scope, $rootScope, detailsService, errorService) {

    $scope.detailsSections = [];
    
    $scope.lastObjectType = null;
    $scope.currentSectionByType = {};
    $scope.detailsMessage = null;
    $scope.loading = false;

    $scope.selectSection = function(sectionIndex) {
        $scope.currentSectionByType[$scope.lastObjectType] = sectionIndex;
    }

    $scope.isSectionSelected = function(sectionIndex) {
        let current = $scope.currentSectionByType[$scope.lastObjectType];
        if (!current) {
            $scope.currentSectionByType[$scope.lastObjectType] = 0;
            return sectionIndex == 0;
        }
        return current == sectionIndex;
    }

    $scope.prettyColumnTitle = function (str) {
    	return capitalizeFirstLetter(str.replace("_", " "));
    }

    $scope.restoreSectionsOpening = function(objectType) {
    	$scope.lastObjectType = objectType;
    }

    $scope.getTableDetails = function(source, databaseObject) {
    	$scope.detailsMessage = null;
        if (!source) {
             $scope.detailsMessage = "No datasource selected";
            return;
        }
        if (source.isLayer && source.currentLayerDatasourceIndex < 0) {
            $scope.detailsMessage = "No datasource selected in layer "+source.name;
            return;
        }

    	$scope.loading = true;
    	if(databaseObject) {
            if (!objectExistsInDatasource(source, databaseObject.id.name, databaseObject.id.schema)) {
                $scope.detailsMessage = "Object "+databaseObject.id.schema + "." + databaseObject.id.name+" does not exist in "+getDatasourceNameNoLayer(source);
    	        $scope.loading = false;
            }
            else {
                detailsService.getDetails(source, "table", databaseObject.id.name, databaseObject.id.schema)
                .then(function(response) {
                      $scope.restoreSectionsOpening("table");
                      $scope.detailsSections = response.data.sections;
                },
                errorService.getGenericHttpErrorCallback())
                .finally(function() {
                   $scope.loading = false;
                });
            }
    	}
    	else {
	    	detailsService.getDetails(source, null, null, null)
		    .then(function(response) {
		    	  $scope.restoreSectionsOpening("source");
		    	  $scope.detailsSections = response.data.sections;
		    },
		    errorService.getGenericHttpErrorCallback())
		    .finally(function() {
	    	   $scope.loading = false;
		    });
    	}
    }
    
    $scope.isRowExcludedByFilter = function(detailsSection, row, filter) {
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
    	if($rootScope.currentSource) {  
			if($rootScope.currentSource.currentObject ) {
				$scope.getTableDetails($rootScope.currentSource, $rootScope.currentSource.currentObject);
			}
			else {
				$scope.getTableDetails($rootScope.currentSource, null);
			}
    	}
    }

    $scope.$on(EVENT_DATABASE_SELECTED, function (event, source) { // NOSONAR EVENT_DATABASE_SELECTED_FOR_DETAILS does exist
        $scope.getTableDetails(source, source.currentObject);
    });

	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED, function (event, source, databaseObject) { // NOSONAR EVENT_DATABASE_SELECTED_FOR_DETAILS does exist
		$scope.getTableDetails(source, databaseObject);
	});

	$scope.$on(EVENT_LAYER_DATABASE_SELECTED, function (event, layerOrSource, source) { // NOSONAR EVENT_DATABASE_SELECTED_FOR_DETAILS does exist
		$scope.getTableDetails(layerOrSource, layerOrSource.currentObject);
	});

	$scope.$on(EVENT_DATABASE_SELECTED_FOR_DETAILS, function (event, source) { // NOSONAR EVENT_DATABASE_SELECTED_FOR_DETAILS does exist
		$scope.getTableDetails(source, null);
	});
    
	$scope.init();
});