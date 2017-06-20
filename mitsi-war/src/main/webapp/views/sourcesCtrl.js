angular.module('mitsiApp')
    .controller('sourcesCtrl', 
    		function($scope, $rootScope, $state, $timeout, $interval, $location, $q, userService, sourceService, errorService) { // NOSONAR too many parameters

	$scope.datasources = [];

	
	$scope.init = function() {
		if($scope.datasources.length > 0) {
			return;
		}
		
		$scope.initSearchFilters();
		
		$scope.globalRefresh();
	}
	
	$scope.initSearchFilters = function() {
		$scope.searchSource = localStorage.getItem("source_searchSource") ? localStorage.getItem("source_searchSource") : "";
		
		$scope.$watch("searchSource", function() {
			localStorage.setItem("source_searchSource", $scope.searchSource);
		});
	}
	
	$scope.initFilterDs = function(ds) {
		ds.searchObject          = $scope.getLocalStorageValueDs(ds, "searchObject");
	}

	
	$scope.localStorageUpdateForDs = function(s, value, modelName) {
		let itemName = "source|"+s.name+"|"+modelName;
		localStorage.setItem(itemName, value);
	}
	
	$scope.getLocalStorageValueDs = function(s, modelName) {
		let itemName = "source|"+s.name+"|"+modelName;
		return localStorage.getItem(itemName);
	}
	
	$scope.keepAlive = function() {
		userService.keepAlive()
		  .then(function(response) {
			  
			  var userHasChanged = false;
			  
			  if($rootScope.loggedUser) {
				  if($rootScope.loggedUser.username !== response.data.connectedUsername) {
					  userHasChanged = true;
				  }
			  }
		  	  else { 
		  		  if(response.data.connectedUsername) {
		  			userHasChanged = true;
		  		  }
		      }

			  if(userHasChanged) {
				  console.log("connected user has changed : "+response.data.connectedUsername+" (was: "+$rootScope.loggedUser.username+")"); // NOSONAR I realy want this log
				  $scope.globalRefresh();
			  }
          });
	}
	
	$scope.initKeepAlive = function() {
	   $interval(function() {
		   $scope.keepAlive();
	   }, 300000);

	} 

	
	$scope.globalRefresh = function() {
		userService.getClientStatus()
		  .then(function(response) { // NOSONAR
			  
			  const responseDatasources = response.data.datasources;
			  if($rootScope.loggedUser) {
				  if(response.data.connectedUsername == null) {
					  $rootScope.loggedUser = null;
				  }
				  else {
					  if($rootScope.loggedUser.username != response.data.connectedUsername) {
						  $rootScope.loggedUser.username = response.data.connectedUsername;
					  }
				  }
			  }
		  	  else { 
		  		  if(response.data.connectedUsername) {
		  			  $rootScope.loggedUser = {"username":response.data.connectedUsername};
		  		  }
		      }

			  var scopeDatasourceNames = {};
			  for(let i=0; i!=$scope.datasources.length; i++) {
				  scopeDatasourceNames[$scope.datasources[i].name] = true;
			  }
			  var responseDatasourceNames = {};
			  for(let i=0; i!=responseDatasources.length; i++) {
				  responseDatasourceNames[responseDatasources[i].name] = i;
			  }

			  // add datasources that do exist yet
			  for(let i=0; i!=responseDatasources.length; i++) {
				  if(!(responseDatasources[i].name in scopeDatasourceNames)) {
					  $scope.initFilterDs(responseDatasources[i]);
					  $scope.datasources.push(responseDatasources[i]);
				  }
			  }
			  for(let i=0; i!=$scope.datasources.length; i++) {
				  // remove datasources that whe do not have right to access anymore
				  if(!($scope.datasources[i].name in responseDatasourceNames)) {
					  $scope.datasources.splice(i);
					  i--; // NOSONAR
				  }
				  // update the others
				  else {
					  const newDatasourceIndex = responseDatasourceNames[$scope.datasources[i].name];
					  const newDatasource = responseDatasources[newDatasourceIndex];
					  $scope.datasources[i].description = newDatasource.description;
					  $scope.datasources[i].tags = newDatasource.tags;
				  }
			  }

		  })
		  .then(function() {
			  $scope.initFromLocation();
		  });
	};
	
	$scope.refresh = function(source, schema) {
		
	   source.loading = true;
	   
	   var deferred = $q.defer();
	   var startLoad = new Date().getTime();

	   sourceService.getObjects(source, schema)
	   .then(function(response) {
		   var startDisplay = new Date().getTime();
		   $scope.initSource(source, response)
		   $timeout(function() {
				   var end = new Date().getTime();
				   console.log("source refresh global time:"+(end-startLoad)+"ms display time:"+(end-startDisplay)+"ms - "+source.name); // NOSONAR I want this log
		   }, 0);
		   deferred.resolve(null);	  
	   })
	   .finally(function() {
		      source.loading = false;
	   });
	   
	   return deferred.promise;
	}
	
	$scope.computeColumnLabels = function(source) {
		
		for(let iObj=0; iObj!=source.objects.length; iObj++) {
			let obj = source.objects[iObj];
			
			if(!obj.columns) {
				continue;
			}
			
			let fkColumnNames = {};
			let indexedColumnNames = {};
			
			if(obj.indexes) {
				for(let i=0; i!=obj.indexes.length; i++) {
					let index = obj.indexes[i];
					if(!index.columns || index.columns=="") {
						continue;
					}
					
					let cols = index.columns.split(",");
					for(let c=0; c!=cols.length; c++) {
						indexedColumnNames[cols[c]] = index;
					}
				}
			}
			
			if(obj.constraints) {
				for(let i=0; i!=obj.constraints.length; i++) {
					let constraint = obj.constraints[i];
					if(constraint.type !== "R") {
						continue;
					}
					
					if(!constraint.columns || constraint.columns=="") {
						continue;
					}
					let cols = constraint.columns.split(",");
					for(let c=0; c!=cols.length; c++) {
						fkColumnNames[cols[c]] = constraint;
					} 
				}
			}
			
			for(let i=0; i!=obj.columns.length; i++) {
				let column = obj.columns[i];
				
				let labels = [];
				let labelsComments = [ ];
				if(column.isPk) {
					labels.push("PK");
					labelsComments.push("Primary Key");
				}
				let index = indexedColumnNames[column.name];
				if(index) {
					if(!column.isPk) {
						labels.push((index.uniqueness=='t' ? "UK" : "I"));
					}
					labelsComments.push("Indexed by " + index.name)
				}
				
				fkLabel = fkColumnNames[column.name];
				if(fkLabel) {
					labels.push("FK");
					labelsComments.push("Foreign Key constraint " + fkLabel.name);
				}
				
				column.labels = labels.join(",");
				column.labelsComments = labelsComments;
				
			}
			
			
			
		}
	}
	
	$scope.initSource = function(source, response) {
		  source.objects = response.data.databaseObjects;
		  source.schemas = response.data.schemas;
		  source.currentSchemaName = null;
		  
		  $scope.computeColumnLabels(source);
		  
		  if(source.schemas) {
			  for(var i=0; i!=source.schemas.length; i++) {
				  if( source.schemas[i].current) {
					  source.currentSchemaName = source.schemas[i].name;
					  break;
				  }
			  }
		  }
		  source.filter = {
				  hideTables:false,
				  hideViews:false,
				  hideMViews:false,
				  tableName:true,
				  columnName:true,
				  indexName:true,
				  constraintName:true,
				  exclusion:"^(.*\\$|SYS_)"
		  };
		  $scope.initGraph(source);
		  

	}
	
	$scope.initGraph = function(datasource) {
		datasource.mitsiGraph = new MitsiGraph(null); // NOSONAR MitsiGraph does realy exist but sonar doesn't see it
		if(!datasource.objects) {
			return;
		}
		datasource.mitsiGraph.initWithDatabaseObjects(datasource.objects);
	}
	
	$scope.isSourceExcludedByFilter = function(source) {
		if(!$scope.searchSource) {
			return false;
		}
		
		let filter = $scope.searchSource.trim().toLowerCase();
		if(filter.length == 0) {
			return false;
		}
		let name = source.name.toLowerCase();
		
		let tags = source.tags ? source.tags.join(" ") : "";
		return name.indexOf( filter ) === -1 && tags.indexOf( filter ) === -1;
	}
	
	$scope.isObjectExcludedByFilter = function(object, source) { // NOSONAR
		if(!source.filter) {
			return false;
		}
		
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
		
		var objectNameLC = object.id.name.toLowerCase(); 
		
		if(source.filter.exclusion && !source.filter.exclusion.trim()=="") {
			var exclusionFilter = source.filter.exclusion.trim().toLowerCase();
			try {
				if(objectNameLC.match( exclusionFilter ) != null) {
					return true;
				}
			}
			catch(e) {
				// if regex syntax is wrong, just use a simple text search 
				if(objectNameLC.indexOf( exclusionFilter ) !== -1) {
					return true;
				}
			}
		} 
	
		if(!source.searchObject) {
			return false;
		}
		
		var filter = source.searchObject.trim().toLowerCase();
		if(filter.length == 0) {
			return false;
		}
		
		if(source.filter.tableName !== false && objectNameLC.indexOf( filter ) !== -1) {
			return false
		}
		
		if(object.columns && source.filter.columnName!== false) {
			for(let i=0; i!=object.columns.length; i++) {
				const columnName=object.columns[i].name;
				if(columnName.toLowerCase().indexOf( filter ) !== -1) {
					return false;
				}
			}
		}
				
		if(object.constraints && source.filter.constraintName!== false) {
			for(let i=0; i!=object.constraints.length; i++) {
				const constraintName=object.constraints[i].name;
				if(constraintName.toLowerCase().indexOf( filter ) !== -1) {
					return false;
				}
			}
		}
				
		if(object.indexes && source.filter.indexName!== false) {
			for(let i=0; i!=object.indexes.length; i++) {
				const indexName=object.indexes[i].name;
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
		
        $rootScope.$broadcast(EVENT_DATABASE_SELECTED, source); // NOSONAR EVENT_DATABASE_SELECTED does exist but sonar does not see it
	}
	
	$scope.selectObject = function(source, object) {
		document.title = source.name+" - "+object.id.name;

		$rootScope.currentSource = source;
		source.currentObject = object;
		
        $rootScope.$broadcast(EVENT_DATABASE_OBJECT_SELECTED, source, object); // NOSONAR EVENT_DATABASE_SELECTED does exist but sonar does not see it

	}
	
	$scope.displayProximityGraph = function(source, object) {
		document.title = source.name+" - "+object.id.name;

		$rootScope.currentSource = source;
		source.currentObject = object;
		
		$state.go("workbench.graph");
        $rootScope.$broadcast(EVENT_DATABASE_OBJECT_SELECTED_FOR_PROXIMITY_GRAPH, source, object); // NOSONAR EVENT_DATABASE_SELECTED does exist but sonar does not see it
	}
	
	$scope.displaySourceInfos = function(source) {
		document.title = source.name;

		$rootScope.currentSource = source;
		source.currentObject = null;
		
		$state.go("workbench.details");
        $rootScope.$broadcast(EVENT_DATABASE_SELECTED_FOR_DETAILS, source); // NOSONAR EVENT_DATABASE_SELECTED does exist but sonar does not see it
	
        if(!source.objects) {
        	$scope.refresh(source, null);
        }
	}
	
	$scope.$on(EVENT_LOGIN_LOGOUT, function (event) { // NOSONAR
		$scope.globalRefresh();
	});

	
	$scope.$on(EVENT_DATABASE_OBJECT_INFO_REQUESTED, function (event, source, databaseObject) { // NOSONAR EVENT_DATABASE_SELECTED does exist but sonar does not see it
		if(!source.objects) {
			return;
		}
		
		let o = null;
		for(let i=0; i!=source.objects.length; i++) {
			o = source.objects[i];
			if(o.id.schema+"."+o.id.name == databaseObject.name) {
				if(source.searchObject && !source.searchObject=="") {
					o.filterPined = true;
				}
				if(!o.accordionOpened) {
					$scope.openObjectAccordion(o);
				}
				break;
			}
		}
		
		if(!o || !o.id) {
			return;
		}
		
		source.selectedId = {schema:o.id.schema, name:o.id.name, type:o.id.type};
		$scope.scrolltoSourceDbObject(source.name, o.id.schema, o.id.name);
	});
	
	$scope.scrolltoSourceDbObject = function(sourceName, schema, objectName) {
		document.getElementById("sourceDbObject_"+sourceName+"_"+schema+"_"+objectName).scrollIntoView(true);
	}
	
	$scope.scrollToSource = function(sourceName) {
		document.getElementById("source_"+sourceName).scrollIntoView(true);
		
        // id="source_{{s.name}}" TODO : remove this line 

	}
	
	$scope.openObjectAccordion = function(o) {
		o.accordionOpened = !o.accordionOpened;
		if(!o.columnsToDisplay) {
			o.columnsToDisplay = o.columns;
		}
	}
	
	$scope.hasLabelsForColumn = function(c) {
		return c.labels && c.labels != "";
	}
	
	$scope.getLabelsForColumn = function(c) {
		return c.labels;
	}
	
    $rootScope.$on('$locationChangeSuccess', function (event) { // NOSONAR keep argument
    	$scope.initFromLocation();
    });
    
    $scope.initFromLocation = function() {
		const s = $location.search();
		if(!s.source) {
			return;
		}

		if(!$rootScope.currentSource ||
			s.source!==$rootScope.currentSource.name) {
			
			let ds = null;
			for(let i=0; i!=$scope.datasources.length; i++) {
				if($scope.datasources[i].name == s.source) {
					ds = $scope.datasources[i];
					break;
				}
			}
			if(!ds) {
				errorService.showGeneralError("Source "+s.source+" does not exist (or you have insuffucient privilleges).");
				return;
			}
			
			ds.accordionOpened = true;
			$rootScope.currentSource = ds;
			$scope.refresh(ds, null)
			.then(function() {
				$scope.scrollToSource(ds.name);
				$rootScope.$broadcast(EVENT_DISPLAY_GRAPH, s.table, s.x, s.y); // NOSONAR EVENT_DISPLAY_GRAPH does exist but sonar does not see it
			});
		}
		else {
			$scope.scrollToSource($rootScope.currentSource.name);
	        $rootScope.$broadcast(EVENT_DISPLAY_GRAPH, s.table, sx, s.y); // NOSONAR EVENT_DISPLAY_GRAPH does exist but sonar does not see it
		}
		
	}
	
	$scope.init();
	$scope.initKeepAlive();

});