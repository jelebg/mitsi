angular.module('mitsiApp')
    .controller('sourcesCtrl', function($scope, $rootScope, $state, userService, sourceService) {

	$scope.datasources = [];

	
	$scope.init = function() {
		if($scope.datasources.length > 0) {
			return;
		}
		
		userService.getClientStatus()
		  .then(function(response) {
			  $scope.datasources = response.data.datasources;

		  }, function(errorMessage) {
		      // called asynchronously if an error occurs
		      // or server returns response with an error status.
			  console.warn( errorMessage );
			  alert( errorMessage );
		  });
	};
	
	$scope.refresh = function(source, schema) {
		
		sourceService.getObjects(source.name, schema)
		  .then(function(response) {
			  source.objects = response.data.databaseObjects;
			  source.schemas = response.data.schemas;
			  source.currentSchemaName = null;
			  
			  for(var i=0; i!=source.schemas.length; i++) {
				  if( source.schemas[i].current) {
					  source.currentSchemaName = source.schemas[i].name;
					  break;
				  }
			  }
			  source.filter = {
					  hideTables:false,
					  hideViews:false,
					  hideMViews:false,
					  tableName:true,
					  columnName:true,
					  indexName:true,
					  constraintName:true
			  };
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
	
	$scope.isObjectExcludedByFilter = function(object, source) {
		var objectName = object.id.name; 
		var objectType = object.id.type; 
		
		if(source.filter.hideTables===true && objectType=="table") {
			return true;
		}
		if(source.filter.hideViews===true && objectType=="view") {
			return true;
		}
		if(source.filter.hideMViews===true && objectType=="matview") {
			return true;
		}
	
		if(!source.searchObject) {
			return false;
		}
		
		var filter = source.searchObject.trim().toLowerCase();
		if(filter.length == 0) {
			return false;
		}
		
		if(source.filter.tableName!== false) {
			if(objectName.toLowerCase().indexOf( filter ) !== -1) {
				return false
			}
		}
		
		if(object.columns && source.filter.columnName!== false) {
			for(var i=0; i!=object.columns.length; i++) {
				var columnName=object.columns[i].name;
				if(columnName.toLowerCase().indexOf( filter ) !== -1) {
					return false;
				}
			}
		}
				
		if(object.constraints && source.filter.constraintName!== false) {
			for(var i=0; i!=object.constraints.length; i++) {
				var constraintName=object.constraints[i].name;
				if(constraintName.toLowerCase().indexOf( filter ) !== -1) {
					return false;
				}
			}
		}
				
		if(object.indexes && source.filter.indexName!== false) {
			for(var i=0; i!=object.indexes.length; i++) {
				var indexName=object.indexes[i].name;
				if(indexName.toLowerCase().indexOf( filter ) !== -1) {
					return false;
				}
			}
		}
		
		return true;

	}
	
	$scope.selectSource = function(source) {
		document.title = source.name;

		$rootScope.currentSource = source;
		if(! source.objects) {
			$scope.refresh(source, null);
		}
		
        $rootScope.$broadcast(EVENT_DATABASE_SELECTED, source);
	}
	
	$scope.selectObject = function(source, object) {
		document.title = source.name+" - "+object.id.name;

		$rootScope.currentSource = source;
		source.currentObject = object;
		
        $rootScope.$broadcast(EVENT_DATABASE_OBJECT_SELECTED, source, object);

	}
	
	$scope.displayProximityGraph = function(source, object) {
		document.title = source.name+" - "+object.id.name;

		$rootScope.currentSource = source;
		source.currentObject = object;
		
		$state.go("workbench.graph");
        $rootScope.$broadcast(EVENT_DATABASE_OBJECT_SELECTED_FOR_PROXIMITY_GRAPH, source, object);
	}
	
	$scope.$on(EVENT_DATABASE_OBJECT_INFO_REQUESTED, function (event, source, databaseObject) {
		if(!source.objects) {
			return;
		}
		
		for(var i=0; i!=source.objects.length; i++) {
			var o = source.objects[i];
			if(o.id.schema+"."+o.id.name == databaseObject.name) {
				if(source.searchObject && !source.searchObject=="") {
					o.filterPined = true;
				}
				o.accordionOpened = true;
				break;
			}
		}
		
		source.selectedId = {schema:o.id.schema, name:o.id.name, type:o.id.type};
		document.getElementById("sourceDbObject_"+source.name+"_"+o.id.schema+"_"+o.id.name).scrollIntoView(true);
	});
	

	
	$scope.init();

});