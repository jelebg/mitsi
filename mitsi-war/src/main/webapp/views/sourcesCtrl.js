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
		let saved = localStorage.getItem("source_searchSource");
		$scope.searchSource = saved ? saved : "";
		
		$scope.$watch("searchSource", function() {
			let tosave = $scope.searchSource;
			localStorage.setItem("source_searchSource", tosave ? tosave : "");
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
	

	
	$scope.computeColumnLabels = function(source, rules) {
		let labelsFilters = {};
		source.labelsFilters = labelsFilters;
		source.labelFilterInclude = {};
		source.labelFilterExclude = {};

		let variables = {
			"source": {
				"name"          : source.name,
				"provider"      : source.dbProvider,
				"currentSchema" : source.currentSchemaName
			}
		};
		$scope.computeColumnCollections(source, variables);

		for(let i=0; i!=rules.length; i++) {
			let rule = rules[i];
			rule.parsedRule = peg.parse(rule.rule);
			if (rule.comment) {
				rule.commentParts = getVariableStringParts(pegVariables, rule.comment);
			}
			if (rule.candidateFkToTable) {
				rule.candidateFkToTableParts = getVariableStringParts(pegVariables, rule.candidateFkToTable);
			}
			
			if (rule.label) {
				if (labelsFilters[rule.label]) {
					if (labelsFilters[rule.label] && rule.labelWarning) {
						// if a label is defined in two rules as warning and normal, then consider it as warning
						labelsFilters[rule.label].type = "warning";
					}
				}
				else {
					labelsFilters[rule.label] = { "label":rule.label, "status":0, "type":"normal", "count":0 };
				}
			}
			if (rule.labelWarning) {
				if (labelsFilters[rule.labelWarning]) {
					// if a label is defined in two rules as warning and normal, then consider it as warning
					// so no need to check here
				}
				else {
					labelsFilters[rule.labelWarning] = { "label":rule.labelWarning, "status":0, "type":"warning", "count":0 };
				}
			}
		}
		
		for(let iObj=0; iObj!=source.objects.length; iObj++) {
			let obj = source.objects[iObj];
			
			if(!obj.columns) {
				continue;
			}

			variables["table"] = {
			        "type"     : obj.id.type,
					"fullName" : source.currentSchemaName+"."+obj.id.name,
					"shortName": obj.id.name
			}

			obj.columnsLabels = {};
			
			for(let i=0; i!=obj.columns.length; i++) {
				let column = obj.columns[i];
				
				variables["column"] = {
						"fullName" : source.currentSchemaName+"."+obj.id.name+"."+column.name,
						"shortName": column.name
				};

				let labels = {
						"normal"   : [],
						"warning"  : []
				}
				let labelsComments = [ ];
				let candidateFks = [];

				$scope.computeRules(rules, variables, labels, labelsComments, candidateFks);
				
				for (let j=0; j!=labels.normal.length; j++) {
					let label = labels.normal[j];
					labelsFilters[label].count ++;
				}
				for (let j=0; j!=labels.warning.length; j++) {
					let label = labels.warning[j];
					labelsFilters[label].count ++;
				}
				
				column.labels = labels.normal.concat(labels.warning);
				column.labelsString = labels.normal.join(",");
				column.labelsWarningString = labels.warning.join(",");
				column.labelsComments = labelsComments;
				// TODO : rajouter le currentSchema aux tables des candidateDks sauf si deja dans le nom
				column.candidateFks = candidateFks;
				
				for(let j=0; j!=column.labels.length; j++) {
					let label = column.labels[j];
					obj.columnsLabels[label] = true;
				}
			}
		}
	}
	
	$scope.computeRules = function(rules, variables, labels, labelsComments, candidateFks) {
		for(let iRule=0; iRule!=rules.length; iRule	++) {
			let rule = rules[iRule];
			let parsedRule = rule.parsedRule;

			// TODO : cleanup custom variables each time (is it really necessary ?)
			let result = ruleCompute(parsedRule, variables, labels);
			if(result) { 
				if(rule.label) { 
					labels.normal.push(rule.label);
				}
				
				if(rule.labelWarning) {
					labels.warning.push(rule.labelWarning);
				}
				
				let comment = null;
				if(rule.commentParts) {
					comment = computeVariableString(rule.commentParts, variables);
					labelsComments.push(comment);
				}
				
				let candidateFkElement = null;
				if(rule.candidateFkToTableParts) {
					let candidateFk = computeVariableString(rule.candidateFkToTableParts, variables);
					candidateFkElement = { 
						"targetTableName" : candidateFk,
					}
					candidateFks.push(candidateFkElement);
				}
				
				if (candidateFkElement && comment) {
					candidateFkElement["comment"] = comment;
				}
			}
		}
	}

	$scope.computeColumnCollections = function(source, collections) {
		// TODO : gérer la case-insensitivity en ne stockant que des majuscules ?
		let fkColumnNames = {};
		let pkColumnNames = {};
		let ukColumnNames = {};
		let indexedColumnNames = {};
		let tablesByShortName  = {};
		let tablesByFullName   = {};
		collections["foreignKeys"] = {
				"columns" : fkColumnNames
		}
		collections["primaryKeys"] = {
				"columns" : pkColumnNames
		}
		collections["uniqueContraints"] = {
				"columns" : ukColumnNames
		}
		collections["index"] = {
				"columns" : indexedColumnNames
		}
		collections["tables"] = {
				"byShortName" : tablesByShortName,
				"byFullName"  : tablesByFullName
		}

		for(let iObj=0; iObj!=source.objects.length; iObj++) {
			let obj = source.objects[iObj];
			
			let table = {
				"shortName" : obj.id.name,
				"fullName"  : obj.id.schema + "." + obj.id.name
			};
			nullSavePushToArrayInCollection(tablesByShortName, table.shortName, table);
			nullSavePushToArrayInCollection(tablesByFullName,  table.fullName,  table);
			
			if(!obj.columns) {
				continue;
			}			
			
			if(obj.indexes) {
				for(let i=0; i!=obj.indexes.length; i++) {
					let index = obj.indexes[i];
					if(!index.columns || index.columns=="") {
						continue;
					}
					
					let cols = index.columns.split(",");
					for(let c=0; c!=cols.length; c++) {
						let columnName = cols[c];
						let columnFullName = source.currentSchemaName+"."+obj.id.name+"."+columnName;
						let current = indexedColumnNames[columnFullName];
						if(!current) {
							current = [];
							indexedColumnNames[columnFullName] = current;
						}
						current.push({"index":index, "position":c+1});
						if(index.uniqueness == 't') {
							let ukCurrent = ukColumnNames[columnFullName];
							if(!ukCurrent) {
								ukCurrent = [];
								ukColumnNames[columnFullName] = ukCurrent;
							}
							ukCurrent.push({"index":index, "position":c+1});
						}
					}
				}
			}
			
			if(obj.constraints) {
				for(let i=0; i!=obj.constraints.length; i++) {
					let constraint = obj.constraints[i];
					if(!constraint.columns || constraint.columns=="") {
						continue;
					}

					if(constraint.type !== "R" && constraint.type !== "P") {
						continue;
					}
					
					let cols = constraint.columns.split(",");
					for(let c=0; c!=cols.length; c++) {
						let columnName = cols[c];
						let columnFullName = source.currentSchemaName+"."+obj.id.name+"."+columnName;

						let current = null;
						if(constraint.type == "R") {
							current = fkColumnNames[columnFullName];
							if(!current) {
								current = [];
								fkColumnNames[columnFullName] = current;
							}
						}
						else {
							current = pkColumnNames[columnFullName];
							if(!current) {
								current = [];
								pkColumnNames[columnFullName] = current;
							}
						}
						current.push({"constraint":constraint, "position":c+1});
					}
				}
			}
		}
	}
	
	$scope.pushUnique = function(arr, str) {
		if(arr.indexOf(str) === -1) {
			arr.push(str);
		}
	}
	
	$scope.initSource = function(source, response) {
		  source.objects = response.data.databaseObjects;
		  source.schemas = response.data.schemas;
		  source.dbProvider = response.data.provider;
		  source.currentSchemaName = null;
		  
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
		  
		  if(response.data.rules) {
			  let startMs = new Date().getTime();
			  $scope.computeColumnLabels(source, response.data.rules);
			  let endMs = new Date().getTime();
			  console.log("rule applying time : " + (endMs-startMs)+"ms");
		  }
		  
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
		
		for (let excludeLabel in source.labelFilterExclude) {
			if ( object.columnsLabels[excludeLabel] ) {
				return true;
			}
		}
		
		for (let includeLabel in source.labelFilterInclude) {
			if ( ! object.columnsLabels[includeLabel] ) {
				return true;
			}
		}
		
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
	
	$scope.getTablePopover = function(o) {
		let type = o.id.type;
		if(o.secondaryType) {
			type = o.secondaryType;
		}
		else {
			if(type.toUpperCase() == "MATVIEW") {
				type = "MATERIALIZED VIEW";
			}
		}
		type = type.toUpperCase();
		return [ type, o.description ].filter(function (val) {return val;}).join(' / ');
    }
	
	$scope.toggleLabel = function(source, label) {
		if(label.count == 0 || !source.labelFilterInclude || !source.labelFilterExclude) {
			return;
		}

		if (source.labelFilterInclude[label.label]) {
			delete source.labelFilterInclude[label.label];
			source.labelFilterExclude[label.label] = true;
		}
		else if (source.labelFilterExclude[label.label]) {
			delete source.labelFilterExclude[label.label];
		}
		else {
			source.labelFilterInclude[label.label] = true;
		}
	}
	
	$scope.getOrderedLabelsFilters = function(source) {
		if (!source.labelsFilters) {
			return null;
		}

		let labelsFilters = Object.values(source.labelsFilters);
		labelsFilters.sort(function(a, b) {
			if (a.type != b.type) {
				return b.type.localeCompare(a.type);
			}
			return a.label.localeCompare(b.label);
		});
		return labelsFilters;
	}
	
	$scope.getLabelClass = function(source, label) {
		if (label.count == 0 || !source.labelFilterInclude || !source.labelFilterExclude) {
			return "labelFilter filterLabelDisabled";
		}
		
		if (label.type == "warning") {
			if (source.labelFilterInclude[label.label]) {
				return "labelFilter filterWarningLabelKeepIfExists";
			}
			else if (source.labelFilterExclude[label.label]) {
				return "labelFilter filterWarningLabelKeepIfNotExists";
			}
			else {
				return "labelFilter filterWarningLabelNotSelected";
			}
		}
		else {
			if (source.labelFilterInclude[label.label]) {
				return "labelFilter filterLabelKeepIfExists";
			}
			else if (source.labelFilterExclude[label.label]) {
				return "labelFilter filterLabelKeepIfNotExists";
			}
			else {
				return "labelFilter filterLabelNotSelected";
			}
		}
	}
	
	$scope.getLabelPopover = function(source, label) {
		if (label.count == 0 || !source.labelFilterInclude || !source.labelFilterExclude) {
			return "the is no occurence of label "+label.label+" in this datasource";
		}

		if (source.labelFilterInclude[label.label]) {
			return "Tables without label "+label.label+" are hidden";
		}
		else if (source.labelFilterExclude[label.label]) {
			return "Tables with label "+label.label+" are hidden";
		}
		else {
			return "Label "+label.label+" is not filtered";
		}
	}
	
	$scope.hasLabelsForColumn = function(c) {
		return c.labelsString && c.labelsString != "";
	}
	
	$scope.getLabelsForColumn = function(c) {
		return c.labelsString;
	}
	
	$scope.hasLabelsWarningForColumn = function(c) {
		return c.labelsWarningString && c.labelsWarningString != "";
	}
	
	$scope.getLabelsWarningForColumn = function(c) {
		return c.labelsWarningString;
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