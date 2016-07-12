angular.module('mitsiApp')
    .controller('sourcesCtrl', function($scope, $rootScope, userService, sourceService) {

	$scope.mya = true;
	$scope.tutu = "sources";
	$scope.datasources = [];

	
	$scope.init = function() {
		if($scope.datasources.length > 0) {
			return;
		}
		
		userService.getClientStatus()
		  .then(function(response) {
			  $scope.datasources = response.data.datasources;

			  /* for(var i=0; i!=$scope.datasources.length; i++) {
				  if($scope.datasources[i].connected) {
					$scope.initGraph($scope.datasources[i]);
				  	$rootScope.$broadcast('DatasourceConnected', $scope.datasources[i]);
				  }
			  }*/

		  }, function(errorMessage) {
		      // called asynchronously if an error occurs
		      // or server returns response with an error status.
			  console.warn( errorMessage );
			  alert( errorMessage );
		  });
	};
	
	// TODO : a supprimer
	$scope.connect = function(source) {
		//alert(source.name);
		//source.connected = !source.connected; 
		if(!source.connected) {
			sourceService.connectDatasource(source.name)
			  .then(function(response) {
				  source.connected = response.data.connected;
				  
				  $rootScope.$broadcast('DatasourceConnected', source);
				  
				  //$scope.refresh(source);
			  }, function(errorMessage) {
			      // called asynchronously if an error occurs
			      // or server returns response with an error status.
				  source.connected = false;
				  console.warn( errorMessage );
				  alert( errorMessage );
			  });
		}
		else {
			sourceService.disconnectDatasource(source.name)
			  .then(function(response) {
				  source.connected = !response.data.disconnected;
			  }, function(errorMessage) {
			      // called asynchronously if an error occurs
			      // or server returns response with an error status.
				  source.connected = false;
				  console.warn( errorMessage );
				  alert( errorMessage );
			  });
		}
	}

	$scope.refresh = function(source) {
		if(!source.connected) {
			source.errorMessage = "my error";
			source.errorDetails = "my details";
			return;
		}
		
		sourceService.getObjects(source.name, null)
		  .then(function(response) {
			  source.objects = response.data.databaseObjects;
			  source.schemas = response.data.schemas;
			  for(var i=0; i!=source.schemas.length; i++) {
				  if(source.schemas[i].current) {
					  source.currentSchema = source.schemas[i];
					  break;
				  }
			  }
			  $scope.initGraph(source);
			  
		  }, function(errorMessage) {
		      // called asynchronously if an error occurs
		      // or server returns response with an error status.
			  console.warn( errorMessage );
			  alert( errorMessage );
		  });
	}
	
	$scope.initGraph = function(datasource) {
		datasource.mitsiGraph = new MitsiGraph(null);
		if(!datasource.objects) {
			return;
		}
		datasource.mitsiGraph.initWithDatabaseObjects(datasource.objects);
	}
	
	$scope.isSourceExcludedByFilter = function(source) {
		if(!$scope.searchSource) {
			return false;
		}
		
		var filter = $scope.searchSource.trim().toLowerCase();
		if(filter.length == 0) {
			return false;
		}
		var name = source.name.toLowerCase();
		var tags = source.tags.join(" ");
		return name.indexOf( filter ) === -1 && tags.indexOf( filter ) === -1;
	}
	
	$scope.isObjectExcludedByFilter = function(id, source) {
		var objectName = id.name; 
		var objectType = id.type; 
		
		if(source.filter) {
			if(source.filter.hideTables===true && objectType=="table") {
				return true;
			}
			if(source.filter.hideViews===true && objectType=="view") {
				return true;
			}
			if(source.filter.hideMViews===true && objectType=="matview") {
				return true;
			}
		}
		
		if(!source.searchObject) {
			return false;
		}
		
		var filter = source.searchObject.trim().toLowerCase();
		if(filter.length == 0) {
			return false;
		}
		var name = objectName.toLowerCase();
		return name.indexOf( filter ) === -1;

	}
	
	$scope.selectSource = function(source) {
		$rootScope.currentSource = source;
		if(! source.objects) {
			$scope.refresh(source)
		}
	}
	
	$scope.selectObject = function(source, object) {
		$rootScope.currentSource = source;
		source.currentObject = object;
		
        $rootScope.$broadcast(EVENT_DATABASE_OBJECT_SELECTED, source, object);

	}
	
	$scope.init();

});