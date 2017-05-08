angular.module('mitsiApp')
    .controller('wgraphOptionsCtrl', function($scope, $rootScope, $modalInstance, options) {
    	$scope.alwaysDisplaySchema = options.alwaysDisplaySchema;
    	$scope.sqlGeneratedWithSchema = options.sqlGeneratedWithSchema;
    	
    	$scope.init = function(options) {
    		$scope.alwaysDisplaySchema    = options.alwaysDisplaySchema;
    		$scope.sqlGeneratedWithSchema = options.sqlGeneratedWithSchema;
    	}
    	
        $scope.closeAndSaveOptionsDialog = function() {
        	$modalInstance.close( {
        		alwaysDisplaySchema    : $scope.alwaysDisplaySchema,
        		sqlGeneratedWithSchema : $scope.sqlGeneratedWithSchema
        	});
        }
        
        $scope.closeOptionsDialog = function() {
        	$modalInstance.dismiss();
        }
    
});

angular.module('mitsiApp')
.controller('wgraphUrlCtrl', function($scope, $rootScope, $modalInstance, graphUrl) {
	$scope.graphUrl = graphUrl;
	
	$scope.init = function(graphUrl) {
		$scope.graphUrl = graphUrl;
	}
    
    $scope.closeOptionsDialog = function() {
    	$modalInstance.dismiss();
    }

});

angular.module('mitsiApp')
    .controller('wgraphCtrl', function($scope, $rootScope, $timeout, $modal, $location, $state) {

	$scope.jsplumb = null;
	$scope.jsplumbContainer = null;
	$scope.divPrefix = "mitsiObject_";
	$scope.tables = {};
	$scope.tablesTemporary = [];
	$scope.hideProximityGraphTimeoutPromise = null;
	$scope.sqlTables = [];
	$scope.sqlText = [];

	$scope.options = {
		alwaysDisplaySchema : false,
		sqlGeneratedWithSchema : false
	}
	
	$scope.pathStart = "";
	$scope.pathEnd = "";
	$scope.paths = [];
	$scope.rpaths = [];

	$scope.TEMPORARY_TABLE_HIDE_TIMEOUT = 600;
	
	$scope.graphUrl = null;
	
	$scope.panelDisplayed = "";
	$scope.panelResizing  = false;
	$scope.panelResizeFromMaxHeight = 0;
	$scope.panelResizeFromPosition = 0;
	
	document.documentElement.addEventListener('mouseup', function(e){
		$scope.onSidePanelResizeEnd();
	});
	document.documentElement.addEventListener('mouseleave', function(e){
		$scope.onSidePanelResizeEnd();
	});

	document.documentElement.addEventListener('mousemove', function(e){
		$scope.onSidePanelResize(e);
	});

	
	$scope.onSidePanelResizeBegin = function(event) {
		$scope.panelResizing = true;
		$scope.panelResizeFromPosition = event.clientY;
		let d = document.getElementsByClassName("sidePanelResizeOriginControl")[0];
		$scope.panelResizeFromMaxHeight = parseInt(d.style.maxHeight.replace("px", ""));
	}
	
	$scope.onSidePanelResize = function(event) {
		if(!$scope.panelResizing) {
			return;
		}
		let panelHeight = $scope.panelResizeFromMaxHeight+$scope.panelResizeFromPosition-event.clientY;
		let maxHeightControls= document.getElementsByClassName("sidePanelResizeMaxHeightControl");
		let heightControls= document.getElementsByClassName("sidePanelResizeHeightControl");
		
		for(let i=0; i!=maxHeightControls.length; i++) {
			maxHeightControls[i].style.maxHeight = panelHeight+"px";
		}
		for(let i=0; i!=heightControls.length; i++) {
			heightControls[i].style.height = panelHeight+"px";
		}
		
		$scope.resizeSidePanelGrid();
	}
	
	$scope.resizeSidePanelGrid = function() {
		if($scope.panelDisplayed == 'data') {
			$scope.$broadcast(EVENT_DATA_GRID_REFRESH, null);
		}
	}
	
	$scope.onSidePanelResizeEnd = function(event) {
		$scope.panelResizing = false;
	}

	$scope.sidePanelHide = function() {
		$scope.panelDisplayed = "";
	}
		
	$scope.sidePanelToggle = function(name) {
		if($scope.panelDisplayed == name) {
			$scope.panelDisplayed = "";
		}
		else {
			$scope.panelDisplayed = name;
		}
		$scope.resizeSidePanelGrid();
	}
	
	$scope.sidePanelShow = function(name) {
		$scope.panelDisplayed = name;
		$scope.resizeSidePanelGrid();
	}
	
	$scope.sidePanelShouldShow = function() {
		return $scope.panelDisplayed != null && $scope.panelDisplayed != "" && (
			($scope.panelDisplayed == 'details' && $scope.sidePanelShouldShowDetails()) 
			||
			($scope.panelDisplayed == 'sql'     && $scope.sidePanelShouldShowSql()) 
			||
			($scope.panelDisplayed == 'filters'     && $scope.sidePanelShouldShowFilters()) 
			||
			($scope.panelDisplayed == 'paths'     && $scope.sidePanelShouldShowPaths()) 
			||
			($scope.panelDisplayed == 'data'     && $scope.sidePanelShouldShowData()) 
		);
	}
	
	$scope.sidePanelShouldShowDetails = function() {
		return $rootScope.currentSource != null && $rootScope.currentSource.currentObject != null;
	}
	
	$scope.sidePanelShouldShowSql = function() {
		return $scope.sqlTables != null && $scope.sqlTables.length > 0;
	}
	
	$scope.sidePanelShouldShowFilters = function() {
		return false;
	}
	
	$scope.sidePanelShouldShowPaths = function() {
		return $scope.paths != null && $scope.paths.length > 0;
	}
	
	$scope.sidePanelShouldShowData = function() {
		return $rootScope.currentSource != null && $rootScope.currentSource.currentObject != null;
	}
	
	$scope.getSidePanelTitle = function() {
		if($scope.panelDisplayed == null || $scope.panelDisplayed == "") {
			return "";
		}
		
		let fullTableName =
			$rootScope.currentSource ? 
		   		($rootScope.currentSource.currentObject ? 
		   			$rootScope.currentSource.currentObject.id.schema + "." + $rootScope.currentSource.currentObject.id.name + " (" + $rootScope.currentSource.currentObject.id.type + ")"
		   			: "" ) 
		   	: "";
		   		
		switch($scope.panelDisplayed) {
		case "details" :
			return fullTableName=="" ? "" : "details of "+fullTableName;
			
		case "sql" :
			return "SQL generated for "+$scope.sqlTables.length+" tables";
			
		case "filters" :
			// TODO
			
		case "paths" :
			return ($scope.paths.length+$scope.rpaths.length)+" path(s) found";
			
		case "data" :
			return fullTableName=="" ? "" : "data of "+fullTableName;
		}
	}

	$scope.sidePanelExtendOnTab = function() {
		switch($scope.panelDisplayed) {
		case "details":
			$state.go("workbench.details");
			return;
			
		case "data":
			$state.go("workbench.data");
			return;
		}
	}

	$scope.backupScope = function() {
		$scope.updateTablesActualPosition();
		
    	$rootScope.backupGraphScope = {
    			tables          : $scope.tables,
    			sqlTables       : $scope.sqlTables,
    			sqlText         : $scope.sqlText
    	};
	}
	$scope.restoreScope = function() {
		if(!$rootScope.backupGraphScope) {
			return;
		}
		$scope.tables          = $rootScope.backupGraphScope.tables;
		$scope.sqlTables       = $rootScope.backupGraphScope.sqlTables;
		$scope.sqlText         = $rootScope.backupGraphScope.sqlText;

		$scope.afterTableUpdateFullRefresh();
	}
	
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) { // NOSONAR keep the parameters
	    if(fromState.name == "workbench.graph") {
	    	$scope.resetTimeoutPromises();
	    	$scope.hideProximityGraph();
	    	$scope.backupScope();
	    }
	    
	});

	
	$scope.initGraphDisplay = function() {
		$scope.removeAllTables();
		$scope.sqlTables = [];
		$scope.sqlText = [];
		$scope.pathStart = "";
		$scope.pathEnd = "";
		$scope.paths = [];
		$scope.rpaths = [];		
	}	
	
	$scope.getPathIndexName = function(index) {
		if(!$rootScope.currentSource) {
			return;
		}
		if(!$rootScope.currentSource.mitsiGraph) {
			return;
		}		
		
		return $rootScope.currentSource.mitsiGraph.getVertexName(index);
	}

	$scope.zoomSlider = {
			  value: 100,
			  options: {
			    floor: 25,
			    ceil: 100,
			    step: 25,
			    hideLimitLabels: true,
			    showTicks: true,
			    showTicksValues: false,
			    boundPointerLabels: false
			    ,vertical: true
			    ,getPointerColor: function(value) { // NOSONAR keep the parameters
		            return 'grey';
		        }
			    ,translate: function(value) {
			        return value+"%";
			    }

			  }
			};
	
	$scope.jsplumbInit = function() {
		$scope.jsplumbContainer = document.getElementById("jsPlumbContainer");
		$scope.jsplumb = jsPlumb.getInstance(); // NOSONAR jsPlumb does exist
		
		$scope.jsplumb.setContainer($scope.jsplumbContainer);
		jsPlumb.importDefaults({
			  Endpoints : [ [ "Dot", { radius:5 } ], [ "Dot", { radius:5 } ] ]
		});

	}
	
	$scope.isTablePathEnd = function(table) {
		return $scope.pathEnd == table.name;
	}
	$scope.setTablePathEnd = function(table) {
		if($scope.pathStart == table.name) {
			$scope.pathStart = "";
			$scope.clearPath();
		}
		if($scope.pathEnd == table.name) {
			$scope.pathEnd = "";
			$scope.clearPath();
		}
		else {
			$scope.pinTemporaryTable(table.name);
			$scope.pathEnd = table.name;
			$scope.computePathIfNecessary();
		}
	}
	$scope.isTablePathStart = function(table) {
		return $scope.pathStart == table.name;
	}
	$scope.setTablePathStart = function(table) {
		if($scope.pathEnd == table.name) {
			$scope.pathEnd = "";
			$scope.clearPath();
		}
		if($scope.pathStart == table.name) {
			$scope.pathStart = "";
			$scope.clearPath();
		}
		else {
			$scope.pinTemporaryTable(table.name);
			$scope.pathStart = table.name;
			$scope.computePathIfNecessary();
		}
	}

	$scope.clearPath = function() {
		$scope.paths  = [];
		$scope.rpaths = [];
		$scope.unhighlightAllConnections();
	}
	
	$scope.computePathIfNecessary = function() {
		if($scope.pathStart=="" || $scope.pathEnd=="") {
			return;
		}
		
		if(!$rootScope.currentSource) {
			return;
		}
		var graph = $rootScope.currentSource.mitsiGraph;
		if(!graph) {
			return;
		}
		
		var startIndex = graph.getIndex($scope.pathStart);
		var endIndex = graph.getIndex($scope.pathEnd);
		
		$scope.paths  = graph.getAllPaths(startIndex, endIndex, false);
		$scope.rpaths = graph.getAllPaths(endIndex, startIndex, false);
		
		$scope.unhighlightAllConnections();
		$scope.highlightPathsConnections($scope.paths);
		$scope.highlightPathsConnections($scope.rpaths);
		$scope.sidePanelShow('paths');
	}
	
	$scope.unhighlightAllConnections = function() {
		var connectionList = $scope.jsplumb.getConnections();
		if(!connectionList) { 
			return; 
		}
		for(const key in connectionList) {
			if(!connectionList.hasOwnProperty(key)) {
				continue;
			}
			
			const connection = connectionList[key];
			connection.setPaintStyle ({ strokeStyle:"lightgrey", lineWidth:3 });
		}
	}
	
	$scope.highlightPathsConnections = function(paths) { // NOSONAR complexity is OK
		for(let iPath=0; iPath!=paths.length; iPath++) {
			const path=paths[iPath];
			
			for(let iTable=0; iTable<path.length-1; iTable++) { // NOSONAR complexity is OK
				const tableFrom = $scope.getPathIndexName(path[iTable]);
				const tableTo = $scope.getPathIndexName(path[iTable+1]);
				if(!tableFrom) {
					continue;
				}
				if(!tableTo) {
					continue;
				}
				
				const connectionList = $scope.jsplumb.getConnections({ source:$scope.divPrefix+tableFrom, target:$scope.divPrefix+tableTo }); 
				if(!connectionList) { 
					continue; 
				}
				for(const key in connectionList) { 
					if(!connectionList.hasOwnProperty(key)) { // NOSONAR complexity is OK
						continue;
					}
					
					const connection = connectionList[key];
					connection.setPaintStyle ({ strokeStyle:"#00ffff", lineWidth:3 });
				}
			}
		}
	};

	
	$scope.isTableInPath= function(tableName) {
		if($scope.paths.length == 0 && $scope.rpaths.length == 0) {
			return false;
		}
		var graph = $rootScope.currentSource.mitsiGraph;
		if(!graph) {
			return false;
		}
		
		var index = graph.getIndex(tableName);
		
		for(let i=0; i!=$scope.paths.length; i++) {
			const path = $scope.paths[i];
			
			if(path.indexOf(index) >= 0) {
				return true;
			}
		}
		for(let i=0; i!=$scope.rpaths.length; i++) {
			const path = $scope.rpaths[i];
			
			if(path.indexOf(index) >= 0) {
				return true;
			}
		}
		
		return false;
	}
	
	$scope.appendTableNoStacking = function(left, top, tableName, horizontalSide) {
		if($scope.existsTable(tableName)) {
			return;
		}
		
		var bestPlace = $scope.getTableBestPlace(left, top, horizontalSide);
		
		$scope.appendTable(bestPlace.x, bestPlace.y, tableName);
		
		var fkList = $scope.getTableFkList(tableName);
		
		$scope.afterTableUpdate(fkList, null);

	}
	
	$scope.getTableFkList = function(tableName) {
		const fkList = [];
		
		const links = $rootScope.currentSource.mitsiGraph.getLinksByName(tableName);
		if(links) {
			for(let i=0; i!=links.length; i++) {
				const link = links[i];
				// remove ? const rtable = link.targetName;
				if(link.targetName in $scope.tables && tableName in $scope.tables) {
					fkList.push({
						fromTable:tableName,
						fromColumns:link.properties.keyColumns,
						toTable:link.targetName,
						toColumns:link.properties.keyColumns});
				} 
			}
		}
		
		const rlinks = $rootScope.currentSource.mitsiGraph.getReverseLinksByName(tableName);
		if(rlinks) {
			for(let i=0; i!=rlinks.length; i++) {
				const link = rlinks[i];
				const rtable2 = $rootScope.currentSource.mitsiGraph.getVertexName(link.target);
				if(rtable2 in $scope.tables && tableName in $scope.tables) {
					fkList.push({
						fromTable:rtable2,
						fromColumns:link.properties.keyColumns,
						toTable:tableName,
						toColumns:link.properties.keyColumns});
				}
			}
		}
		
		return fkList;
	}
	
	$scope.afterTableUpdate = function(fklist, posses) {
		$timeout(function() { // NOSONAR complexity is OK
			if(fklist) {
				for(var i=0; i!=fklist.length; i++) {
					var mafk = fklist[i];
					$scope.fk(mafk.fromTable, mafk.toTable, mafk.fromColumns, mafk.toColumns);
				}
			}			
			
			for(var tableName in $scope.tables) {
				if(!$scope.tables.hasOwnProperty(tableName)) { // NOSONAR complexity is OK
					continue;
				}
				
				var telt = document.getElementById($scope.divPrefix+tableName);
				if(telt != null) {
					$scope.jsplumb.revalidate(telt);
				}
			}
			$scope.jsplumb.draggable(document.querySelectorAll(".linksTable"), {});

			if(posses) {
				for(var posse in posses) {
					if(!posses.hasOwnProperty(posse)) { 
						continue;
					}
					const tables = posses[posse];
					
					if(tables.length > 0) { // NOSONAR complexity is OK
						const tableElt = document.getElementById($scope.divPrefix+posse);
						if(tableElt) { // NOSONAR complexity is OK
							$scope.jsplumb.addToPosse(tableElt, posse);
						}
					}
					
					for(let i=0; i!=tables.length; i++) {
						const tableName = tables[i];
						const tableElt = document.getElementById($scope.divPrefix+tableName);
						if(tableElt) { // NOSONAR complexity is OK
							$scope.jsplumb.addToPosse(tableElt, posse);
						}
					}
					
				}
			}
			
		}, 0);
	}
	
	$scope.afterTableUpdateFullRefresh = function() {
		var fkList = [];

		for(var tableName in $scope.tables) {
			if(!$scope.tables.hasOwnProperty(tableName)) { // NOSONAR complexity is OK
				continue;
			}
			
			var newFks = $scope.getTableFkList(tableName);
			fkList = fkList.concat(newFks);
		}
		
		// no posses in this special case
		$scope.afterTableUpdate(fkList, null);
	}


	
	$scope.getTableBestPlace = function(left, top) {
		const dx = 40;
		const dy = 40;
		const maxIJ = 10;
		let newLeft;
		const maxLeft = 500;
		let newTop;
		for(let i=0; i<maxIJ; i++) {
			newLeft = left;
			newTop  = top+(i)*dy;

			while(newLeft < maxLeft) {
				const elt = $scope.getTableAtXY(newLeft, newTop);
				if(elt == null) {
					return {x:newLeft, y:newTop};
				}
				newLeft = elt.offsetLeft + elt.offsetWidth + dx;
			}
		}
		return {x:(left+10), y:(top+10)};
	}
	
	$scope.getTableAtXY = function(left, top) {
		const elts = $scope.jsplumbContainer.childNodes;
		const myMargin = 10;
		for(var i=0; i!=elts.length; i++) {
			var elt = elts[i];
			if(elt.nodeName != "DIV") {
				continue;
			}
			if((left+myMargin)>elt.offsetLeft && (left-myMargin)<(elt.offsetLeft+elt.offsetWidth) &&
			   (top+myMargin)>elt.offsetTop && (top-myMargin)<(elt.offsetTop+elt.offsetHeight)	) {
				return elt;
			}
		}
		return null;
	}
	
	$scope.getTableLinksFrom = function(tableName) {
		if(! $scope.currentSource ||
				! $scope.currentSource.mitsiGraph) {
			return;
		}
		var linkedTables = $scope.currentSource.mitsiGraph.getReverseLinksByName(tableName);
		if(linkedTables == null) {
			return;
		}
		var result = [];
		
		for(var i=0; i!=linkedTables.length; i++) {
			var t = linkedTables[i];
			if($scope.tables[t.targetName] == null) {
				result.push(t);
			}
		}
		
		return result;
	}
	$scope.getTableLinksTo = function(tableName) {
		if(! $scope.currentSource||
				! $scope.currentSource.mitsiGraph) {
			return;
		}
		var linkedTables = $scope.currentSource.mitsiGraph.getLinksByName(tableName);
		if(linkedTables == null) {
			return;
		}
		var result = [];
		
		for(var i=0; i!=linkedTables.length; i++) {
			var t = linkedTables[i];
			if($scope.tables[t.targetName] == null) {
				result.push(t);
			}
		}
		
		return result;
	}
	
	$scope.hasTableMissingLinks = function(tableName, checkFrom, checkTo) { // NOSONAR complexity is OK
		if(! $scope.currentSource||
				! $scope.currentSource.mitsiGraph) {
			return false;
		}
		
		if(checkTo) {
			const linkedTables = $scope.currentSource.mitsiGraph.getLinksByName(tableName);
			if(linkedTables != null) {
				for(let i=0; i!=linkedTables.length; i++) {
					const t = linkedTables[i];
					if(! (t.targetName in $scope.tables)) { // NOSONAR complexity is OK
						return true;
					}
				}
			}
		}
		
		if(checkFrom) {		
			const linkedTables = $scope.currentSource.mitsiGraph.getReverseLinksByName(tableName);
			if(linkedTables != null) {
				for(let i=0; i!=linkedTables.length; i++) {
					const t = linkedTables[i];
					if(! (t.targetName in $scope.tables)) { // NOSONAR complexity is OK
						return true;
					}
				}
			}		
		}
	
		return false;
	}

	$scope.fk = function(from, to, columnsFrom, columnsTo) {
		var autoCycle = (from==to);
		
		if($scope.jsplumb.select({source:$scope.divPrefix+from, target:$scope.divPrefix+to}).length > 0) {
			// TODO : checker qu'on est bien sur les meme champs en récupérant les labels
			return;
		}
		
		let connection;
		if(autoCycle) {
			try {
				$scope.jsplumb.addEndpoint($scope.divPrefix+from, 
						{
				            endpoint: "Dot",
				            paintStyle:{ 
						    	strokeStyle:"lightgrey", 
						    	lineWidth:2,
						    	radius:5
						    },
				            isSource: true
				        }, 
						{ anchor: "RightMiddle", uuid: $scope.divPrefix+from+"FromUUID" }
					);
				$scope.jsplumb.addEndpoint($scope.divPrefix+to, 
						{
				            endpoint: "Dot",
				            paintStyle:{ 
						    	strokeStyle:"lightgrey", 
						    	lineWidth:2,
						    	radius:5
						    },
				            isTarget: true
				        }, 
						{ anchor: "TopCenter", uuid: $scope.divPrefix+to+"ToUUID" }
					);
		
				
				connection = $scope.jsplumb.connect({
					uuids : [ $scope.divPrefix+to+"ToUUID", $scope.divPrefix+from+"FromUUID" ]
				    ,paintStyle:{ 
				    	strokeStyle:"lightgrey", 
				    	lineWidth:3
				    }
			    	,hoverPaintStyle:{ 
			    		strokeStyle:"black", 
			    	    lineWidth:4
			    	}
			    	,endpointStyle:{ 
			    		fillStyle:"lightgrey", 
			    		outlineWidth:1 
			    	}
			    	,connector: [ "StateMachine" ]
					,overlays:[ "Arrow", 
						[ "Label", { label:columnsFrom, location:0.1, labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}} ] 
						,[ "Label", { label:columnsTo, location:0.7, labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}} ]
					  ]
			    	,detachable:false
				});
			}
			catch(e) {
				console.log(e); // NOSONAR I want this log
				throw e;
			}
		}
		else {
			connection = $scope.jsplumb.connect({
				source:$scope.divPrefix+from,
				target:$scope.divPrefix+to
			    ,paintStyle:{ 
			    	strokeStyle:"lightgrey", 
			    	lineWidth:3
			    }
		    	,hoverPaintStyle:{ 
		    		strokeStyle:"black", 
		    	    lineWidth:4
		    	}
		    	,endpointStyle:{ 
		    		fillStyle:"lightgrey", 
		    		outlineWidth:1 
		    	}
		    	,anchor: [ "Right", "Left" ]
		    	,connector: [ "Bezier", { curviness:50 } ]
				,overlays:[ "Arrow", 
					[ "Label", { label:columnsFrom, location:0.2,
						labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}
					} ] 
					,[ "Label", { label:columnsTo, location:0.8,
						labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}
					} ]
				  ]
		    	,detachable:false
			});
		}
		if(connection) {
			$scope.displayAllLabelsOnConnection(connection, false);
	
			connection.bind("mouseover", function(conn) {
				$scope.displayAllLabelsOnConnection(conn, true);
			});
			connection.bind("mouseout", function(conn) {
				$scope.displayAllLabelsOnConnection(conn, false);
			});
		}
	}
	
	$scope.displayAllLabelsOnConnection = function(connection, display) {
		if(!connection || !connection.getOverlays) {
			return;
		}
		const overlays = connection.getOverlays();
		if(!overlays) {
			return;
		}
		for(const overlayId in overlays) {
			if(!overlays.hasOwnProperty(overlayId)) {
				continue;
			}

			const overlay = overlays[overlayId];
			if(overlay.label) {
				if(display) {
					connection.showOverlay(overlayId) ;
				}
				else {
					connection.hideOverlay(overlayId) ;
				}
			}
		}

	}
	
	$scope.$on(EVENT_DATABASE_SELECTED, function (event, source) { // NOSONAR EVENT_DATABASE_SELECTED does exist
		$scope.initGraphDisplay();	
	});
	
	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED, function (event, source, databaseObject) { // NOSONAR EVENT_DATABASE_OBJECT_SELECTED does exist
		
		if(databaseObject && databaseObject.id) {
			var tableName = databaseObject.id.schema+"."+databaseObject.id.name;
			$scope.appendTableNoStacking(400, 300, tableName);
		}
		
	});
	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED_FOR_PROXIMITY_GRAPH, function (event, source, databaseObject) { // NOSONAR EVENT_DATABASE_OBJECT_SELECTED_FOR_PROXIMITY_GRAPH does exist
		
		if(databaseObject && databaseObject.id) {
			var tableName = databaseObject.id.schema+"."+databaseObject.id.name;
			$scope.removeAllTables();
			$scope.displayProximityGraph(tableName);
		}
		
	});
	
	$scope.resetTimeoutPromises = function() {
		if($scope.hideProximityGraphTimeoutPromise != null) {
			$timeout.cancel($scope.hideProximityGraphTimeoutPromise);
			$scope.hideProximityGraphTimeoutPromise = null;
		}
	}
	
	$scope.mouseOverTableName = function(table) { // NOSONAR keep parameter table
		this.showIcons = true;
		
		$scope.resetTimeoutPromises();
		
	}
	$scope.mouseLeaveTableName = function() {
		this.showIcons = false;

		$scope.resetTimeoutPromises();
		
		$scope.hideProximityGraphTimeoutPromise = $timeout(function() {
			$scope.hideProximityGraph();
		}, $scope.TEMPORARY_TABLE_HIDE_TIMEOUT);
	}
	
	$scope.mouseOverAsterisk = function(table) {
		
		$scope.resetTimeoutPromises();

		if($scope.hasTableMissingLinks(table.name, true, true)) {
			$scope.displayProximityGraph(table.name, true);
		}
	}
	$scope.mouseLeaveAsterisk = function() {

		$scope.resetTimeoutPromises();
		
		$scope.hideProximityGraphTimeoutPromise = $timeout(function() {
			$scope.hideProximityGraph();
		}, $scope.TEMPORARY_TABLE_HIDE_TIMEOUT);

	}
	
	$scope.tablesInit = function() {
		
		// keep ? $scope.jsplumb.deleteEveryEndpoint();;
		// TODO : hum ca ne sert surement à rien tout ça
		if($scope.jsplumb) {
			$scope.jsplumb.detachEveryConnection();
			for(const t in $scope.tables) {
				if(!$scope.tables.hasOwnProperty(t)) {
					continue;
				}
				
				$scope.jsplumb.remove($scope.divPrefix + t.name);
			}
		}
			
		$scope.tables = {};
		
	}

	$scope.appendTable = function(left, top, tableName) {

		if(!(tableName in $scope.tables)) {
			$scope.tables[tableName] = {name:tableName, x:left, y:top };
			
			$scope.resizeJsPlumbContainerIfNecessary(left, top);
		}
	}
	
	$scope.existsTable = function(tableName) {
		return ($scope.tables[tableName] !=null);

	}

	
	$scope.removeTable = function(tableName, withTemporary) {
		var tableElt = document.getElementById($scope.divPrefix+tableName);
		if(tableElt) {
			$scope.jsplumb.removeFromAllPosses(tableElt);
			$scope.jsplumb.detachAllConnections(tableElt);
			$scope.jsplumb.removeAllEndpoints(tableElt);
			$scope.jsplumb.remove(tableElt);
		}
		delete $scope.tables[tableName];	
		
		if(withTemporary===true) {
			var i = $scope.tablesTemporary.indexOf(tableName);
			if(i >= 0) {
				$scope.tablesTemporary.splice(i, 1);
			}
			$scope.mouseLeaveTableName();
		}

	}
	
	$scope.removeAllTables = function() {
		for(const t in $scope.tables) {
			if(!$scope.tables.hasOwnProperty(t)) {
				continue;
			}
			
			const tableElt = document.getElementById($scope.divPrefix + t);
			if(tableElt) {
				$scope.jsplumb.removeFromAllPosses(tableElt);
				$scope.jsplumb.detachAllConnections(tableElt);
				$scope.jsplumb.removeAllEndpoints(tableElt);
				$scope.jsplumb.remove(tableElt);
			}
		}
		$scope.tables = {};
		$scope.tablesTemporary = [];
		$scope.sqlTables = [];
		$scope.sqlText = [];
	}
	
	$scope.pinTemporaryTable = function(tableName) {
		var i = $scope.tablesTemporary.indexOf(tableName);
		if(i >= 0) {
			$scope.tablesTemporary.splice(i, 1);
		}
		
		var tableElt = document.getElementById($scope.divPrefix+tableName);
		if(tableElt) {
			$scope.jsplumb.removeFromAllPosses(tableElt);
		}

	}

	$scope.pinTemporaryLinkedTables = function(tableName) {
		var linkedTablesTo = $scope.currentSource.mitsiGraph.getReverseLinksByName(tableName);
		if(linkedTablesTo != null) {
			for(let i=0; i!=linkedTablesTo.length; i++) {
				const t=linkedTablesTo[i];
				$scope.pinTemporaryTable(t.targetName);
			}
		}
		var linkedTablesFrom = $scope.currentSource.mitsiGraph.getLinksByName(tableName);
		if(linkedTablesFrom != null) {
			for(let i=0; i!=linkedTablesFrom.length; i++) {
				const t=linkedTablesFrom[i];
				$scope.pinTemporaryTable(t.targetName);
			}
		}
		
	}

	$scope.selectTable = function(table) {
		let source = $rootScope.currentSource;
		if(!source) {
			return ;
		}
		
		for(let i=0; i!=source.length; i++) {
			let o = source.objects[i];
			if((o.id.schema+"."+o.id.name) == table.name) {
				$rootScope.currentSource.currentObject = o;
		        $rootScope.$broadcast(EVENT_DATABASE_OBJECT_SELECTED, source, o); // NOSONAR EVENT_DATABASE_SELECTED does exist but sonar does not see it
				break;
			}
		}
	}
	
	$scope.isTableSelected = function(tableName) {
		if(!$rootScope.currentSource) {
			return false;
		}
		var currentObject = $rootScope.currentSource.currentObject;
		if(!currentObject) {
			return false;
		}
		var currentObjectName = currentObject.id.schema+"."+currentObject.id.name;
		return currentObjectName == tableName;
	}

	$scope.isTableTemporary = function(tableName) {
		return $scope.tablesTemporary.indexOf(tableName)!=-1;
	}
	
	$scope.hideProximityGraph = function() {
		
		for(var i=0; i!=$scope.tablesTemporary.length; i++) {
			var tableName = $scope.tablesTemporary[i];
			$scope.jsplumb.removeFromAllPosses(document.getElementById($scope.divPrefix+tableName));
			$scope.removeTable(tableName);
		}
		
		$scope.tablesTemporary = [];

	}
	
	$scope.displayProximityGraph = function(currentVertexName, temporary) { // NOSONAR complexity is OK
		var depth = 1;
		var name = currentVertexName;
		var existingTables = [];
		var appendedTables = [];
		var posses = {};
		if(temporary) {
			posses[currentVertexName] = []; 
		}
		
		var graph = $rootScope.currentSource.mitsiGraph;
		var currentVertexIndex = graph.getIndex(currentVertexName);
		var proximityGraph = graph.getProximityGraph(currentVertexIndex, depth);
		
		var radiu = [];
		
		// compute radius considering the max number of linked tables for each level, before or after 
		var maxmax = 0;
		for(var i=0; i!=depth; i++) {
			var max = Math.max(proximityGraph.before[i].length , proximityGraph.after[i].length);
			if(max > maxmax) {
				maxmax = max;
			}
			var r = (i+1)*Math.max(200, maxmax * 30);
			radiu[i] = r;
		}
		var x0 = radiu[depth-1]+100;
		var y0 = radiu[depth-1]+10;
		if(name in $scope.tables) {
			var tdiv = document.getElementById($scope.divPrefix+name);
			x0 = tdiv.offsetLeft;
			y0 = tdiv.offsetTop;
			existingTables.push(name);
		}
		else {
			$scope.appendTable(x0+40, y0+20, name);
			appendedTables.push(name);
		}
		
		// append tables
		for(let i=0; i!=depth; i++) {
			for(let j=0; j!=proximityGraph.before[i].length; j++) {
				const index = proximityGraph.before[i][j];
				const vertexName = graph.getVertexName(index);
				if(vertexName in $scope.tables) {
					existingTables.push(vertexName);
				}
				else {
					$scope.appendTable( 
							Math.floor(x0-radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.before[i].length+3))),
							Math.floor(y0-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.before[i].length+3))),
							vertexName);
					if(temporary===true) { // NOSONAR complexity is OK
						$scope.tablesTemporary.push(vertexName);
						posses[currentVertexName].push(vertexName);
					}
					appendedTables.push(vertexName);
				}
			}
			for(let j=0; j!=proximityGraph.after[i].length; j++) {
				const index = proximityGraph.after[i][j];
				const vertexName = graph.getVertexName(index);
				if(vertexName in $scope.tables) {
					existingTables.push(vertexName);
				}
				else {
					$scope.appendTable( 
							Math.max(0, x0+80+radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.after[i].length+3))), 
							Math.max(0, y0+40-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.after[i].length+3))), 
							vertexName);
					if(temporary===true) { // NOSONAR complexity is OK
						$scope.tablesTemporary.push(vertexName);
						posses[currentVertexName].push(vertexName);
					}
					appendedTables.push(vertexName);
				}
			}
		}
		
		// append links between tables
		// TODO : verifier qu'on n'ajoute pas deux fois la même FK
		var fklist = [];
		$scope.appendVertexLinks(graph, fklist, graph.getVertex(currentVertexIndex), existingTables);
		for(let i=0; i!=depth; i++) {
			for(let j=0; j!=proximityGraph.before[i].length; j++) {
				const index = proximityGraph.before[i][j];
				const vertex = graph.getVertex(index);
				$scope.appendVertexLinks(graph, fklist, vertex, existingTables);
			}
			for(let j=0; j!=proximityGraph.after[i].length; j++) {
				const index = proximityGraph.after[i][j];
				const vertex = graph.getVertex(index);
				$scope.appendVertexLinks(graph, fklist, vertex, existingTables);
			}
		}
		
		$scope.checkTablesWithNegativePostion();
		$scope.afterTableUpdate(fklist, posses);
	}

	$scope.checkTablesWithNegativePostion = function() { // NOSONAR complexity is OK
		$scope.updateTablesActualPosition();
		
		const graphParent = document.getElementById("graphParent");
		if(!graphParent) {
			return;
		}
		
		var minNegativeX = 0;
		var minNegativeY = 0;
		for(const tableName in $scope.tables) {
			if(!$scope.tables.hasOwnProperty(tableName)) {
				continue;
			}
			
			const t = $scope.tables[tableName];
			if(t.x < minNegativeX) {
				minNegativeX = t.x;
			}
			if(t.y < minNegativeY) {
				minNegativeY = t.y;
			}
		}
		if(minNegativeX < 0) {
			for(const tableName in $scope.tables) {
				if(!$scope.tables.hasOwnProperty(tableName)) {
					continue;
				}
				
				$scope.tables[tableName].x = $scope.tables[tableName].x-minNegativeX+60;
			}
			
			const scroll = document.getElementById("graphScroll");
			const newScrollLeft = graphParent.scrollLeft - minNegativeX + 60;
			scroll.scrollLeft = newScrollLeft;
			
		}

		if(minNegativeY < 0) {
			for(const tableName in $scope.tables) {
				if(!$scope.tables.hasOwnProperty(tableName)) {
					continue;
				}
				
				$scope.tables[tableName].y = $scope.tables[tableName].y-minNegativeY+60;
			}
			
			const scroll = document.getElementById("graphScroll");
			const newScrollTop = graphParent.scrollTop - minNegativeY + 60;
			scroll.scrollTop = newScrollTop;

		}
	}
	
	$scope.appendVertexLinks = function(graph, fklist, vertex, existingTables) {
		for(let i=0; i!=vertex.links.length; i++) {
			const l = vertex.links[i];
			const targetVertexName = graph.getVertexName(l.target);
			
			if((existingTables.indexOf(vertex.name) == -1 || existingTables.indexOf(targetVertexName) == -1) &&
				vertex.name in $scope.tables && 
				targetVertexName in $scope.tables) {
					fklist.push({
						fromTable:vertex.name,
						fromColumns:l.properties.keyColumns,
						toTable:targetVertexName,
						toColumns:l.properties.rKeyColumns});
			}
		}

		for(let i=0; i!=vertex.reverseLinks.length; i++) {
			const l = vertex.reverseLinks[i];
			const targetVertexName = graph.getVertexName(l.target);
			
			if((existingTables.indexOf(vertex.name) == -1 || existingTables.indexOf(targetVertexName) == -1) &&
				vertex.name in $scope.tables && 
				targetVertexName in $scope.tables) {
					fklist.push({
						fromTable:targetVertexName,
						fromColumns:l.properties.keyColumns,
						toTable:vertex.name,
						toColumns:l.properties.rKeyColumns});
			}
		}
	}
	
	$scope.removeAllTablesInSQL = function() {
		$scope.sqlTables = [];
		$scope.updateSQLText();
	}
	
	$scope.toggleTableInSQL = function(table) {
		let i = $scope.sqlTables.indexOf(table.name);
		if(i == -1) {
			$scope.sqlTables.push(table.name);
			
			i = $scope.tablesTemporary.indexOf(table.name);
			if(i != -1) {
				$scope.tablesTemporary.splice(i, 1);
			}
		}
		else {
			$scope.sqlTables.splice(i, 1);
		}

		
		$scope.updateSQLText();
		$scope.sidePanelShow("sql");
	}
	
	$scope.isTableInSQL = function(table) {
		return $scope.sqlTables.indexOf(table.name) != -1;
	}
	
	$scope.updateSQLText = function() { // NOSONAR complexity is OK
		$scope.sqlText = "";
		if($scope.sqlTables.length == 0) {
			return;
		}
		
		const connectedSubGroups = $scope.getConnectedSubGroups($scope.sqlTables);
		$scope.sqlText = [];
		
		if(connectedSubGroups.length > 1) {
			$scope.sqlText.push("/!\\ not all tables are connected together /!\\");
		}
		for(let i=0; i!=connectedSubGroups.length; i++) {
			const subGroup = connectedSubGroups[i];
			
			for(let j=0; j!=subGroup.length; j++) {
				const link=subGroup[j];
				if(link.found=="none_first" || link.found=="isolate") {
					const tableName = $scope.getTableNameForSql(link.fromName);
					$scope.sqlText.push((i==0 ? "FROM" : ",")+" "+tableName);
				}
				if(link.found!="isolate") {
					const fromTableName = $scope.getTableNameForSql(link.fromName);
					const toTableName   = $scope.getTableNameForSql(link.toName);
					$scope.sqlText.push(
							  "join "+(link.found=="to"?fromTableName:toTableName)
							+ " on "
							+ $scope.getJoinConditionFromFKs(fromTableName, toTableName, link.fromKeyColumns, link.toKeyColumns)
						);
				}
			}
		}
	}
	
	$scope.getJoinConditionFromFKs = function(fromName, toName, fromKeyColumns, toKeyColumns) {
		const froms = fromKeyColumns.split("\n");
		const tos = toKeyColumns.split("\n");
		
		let condition = "";

		if(froms.length > 1) {
			let first = true;
			for(let i=0; i!=froms.length; i++) {
				condition = condition 
						+ (first ? "" : " or ")
						+ "(" 
						+ $scope.getJoinConditionFromColumns(fromName, toName, froms[0], tos[0])
						+ ")"
						;
				first = false;
			}
		}
		else {
			condition = $scope.getJoinConditionFromColumns(fromName, toName, froms[0], tos[0]);
		}
		return condition;
	}
	
	$scope.getJoinConditionFromColumns = function(fromName, toName, fromKeyColumns, toKeyColumns) {
		const froms = fromKeyColumns.split(",");
		const tos = toKeyColumns.split(",");
		
		let condition = "";
		let first = true;
		for(let i=0; i!=froms.length; i++) {
			if(first) {
				first = false;
			}
			else {
				condition = condition + " and ";
			}
			condition = condition + fromName + "." + froms[i] + " = " + toName + "." + tos[i];
		}
		
		return condition;
	}
	
	$scope.getConnectedSubGroups = function(tableNames) { // NOSONAR complexity is OK
		const graph = $scope.currentSource.mitsiGraph;
		const links = [];
		let currentSubGroup = [];
		const subGroups = [];
		const tablesWithLinks = {};
		
		for(let i=0; i!=tableNames.length; i++) {
			const tableName = tableNames[i];
			const vertexConnections = graph.getLinksByName(tableName);
			for(let j=0; j!=vertexConnections.length; j++) { // NOSONAR complexity is OK
				const vertexConnection = vertexConnections[j];
				const targetName = vertexConnection.targetName;
				
				// ignore auto-loop 
				if(targetName==tableName) { // NOSONAR complexity is OK
					continue;
				}
				
				// ignore where link does not concern one of the selected tables
				if(tableNames.indexOf(targetName) == -1) { // NOSONAR complexity is OK
					continue;
				}
				
				tablesWithLinks[tableName] = 0;
				tablesWithLinks[targetName] = 0;
				links.push({fromName:tableName,
							toName:targetName,
							fromKeyColumns:vertexConnection.properties.keyColumns,
							toKeyColumns:vertexConnection.properties.rKeyColumns,
							done:false,
							found:""});
			}
			
		}
		
		let allDone = false;
		let nothingFoundThisLoop;
		const currentSubGroupTables = [];
		while(!allDone) {
			allDone = true;
			nothingFoundThisLoop = true;
			for(let i=0; i!=links.length; i++) { // NOSONAR complexity is OK
				const link = links[i]
				if(link.done) {
					continue;
				}
				allDone = false;

				// for the first link, we add it without question
				if(currentSubGroup.length==0) {
					nothingFoundThisLoop = false;
					link.done = true;
					link.found = "none_first";
					currentSubGroup.push(link);
					currentSubGroupTables.push(link.fromName);
					currentSubGroupTables.push(link.toName);
					continue;
				}
				
				// found link from the current subgroup ?
				if(currentSubGroupTables.indexOf(link.fromName) != -1) {
					nothingFoundThisLoop = false;
					link.done = true;
					link.found = "from";
					currentSubGroup.push(link);
					currentSubGroupTables.push(link.toName);
					continue;
				}
				
				// found link to the current subgroup ?
				if(currentSubGroupTables.indexOf(link.toName) != -1) {
					nothingFoundThisLoop = false;
					link.done = true;
					link.found = "to";
					currentSubGroup.push(link);
					currentSubGroupTables.push(link.fromName);
					continue;
				}
		
			}
			
			if(nothingFoundThisLoop && !allDone) {
				// subGroup finished, let's create a new subGroup
				subGroups.push(currentSubGroup);
				currentSubGroup = [];
			}
		}
		
		// TODO : should be useles, because the last loop did nothing. remove ?
		if(currentSubGroup.length > 0) {
			subGroups.push(currentSubGroup);
		}
		
		// we should not forget the tables with no link at all
		for(let i=0; i!=tableNames.length; i++) {
			const tableName = tableNames[i];
			if( ! (tableName in tablesWithLinks)) {
				subGroups.push( [ { fromName:tableName, toName:null, found:"isolate" } ] );
			}
		}
		
		return subGroups;
		
	}
	
	$scope.requestInfo = function(object) {
        $rootScope.$broadcast(EVENT_DATABASE_OBJECT_INFO_REQUESTED, $rootScope.currentSource, object); // NOSONAR EVENT_DATABASE_OBJECT_INFO_REQUESTED does exist
	}
	
	$scope.showGraphUrlDialog = function() {

		$modal.open({
		      animation: true,
		      ariaLabelledBy: 'modal-title',
		      ariaDescribedBy: 'modal-body',
		      templateUrl: 'popups/graphUrl.inline.html',
		      controller: 'wgraphUrlCtrl',
		      resolve: {
		    	  graphUrl: function () {
		            return $scope.graphUrl;
		          }
		        }
		    });
	
	}
	
	$scope.showOptionsDialog = function() {

		const modalInstance = $modal.open({
		      animation: true,
		      ariaLabelledBy: 'modal-title',
		      ariaDescribedBy: 'modal-body',
		      templateUrl: 'popups/graphOptions.inline.html',
		      controller: 'wgraphOptionsCtrl',
		      //controllerAs: '$ctrl',
		      resolve: {
		          options: function () {
		            return $scope.options;
		          }
		        }

		    });
	
		modalInstance.result.then(function (options) {
		      $scope.options = options;
			  $scope.updateSQLText();
		    }, function () {
		      // nothing
		    });
	
	}
	
	$scope.getTableNameForSql = function(name) {
		if($scope.options.sqlGeneratedWithSchema) {
			return name;
		}
		
		const i = name.indexOf(".");
		if(i<0 || name.substring(0, i)!==$rootScope.currentSource.currentSchemaName) {
			return name;
		}
		
		return name.substring(i+1);
	}
	
	$scope.getTableDisplayName = function(name) {
		if($scope.options.alwaysDisplaySchema) {
			return name;
		}
		
		const i = name.indexOf(".");
		if(i<0 || name.substring(0, i)!==$rootScope.currentSource.currentSchemaName) {
			return name;
		}
		
		return name.substring(i+1);
	}
	
	$scope.$on(EVENT_DISPLAY_GRAPH, function (event, tableList, xList, yList) { // NOSONAR EVENT_DISPLAY_GRAPH does exist
		
		if(tableList && xList && yList) {
			$scope.removeAllTables();
			
			let fklist = [];
			const nbTables = Math.min(tableList.length, xList.length, yList.length);
			for(let i=0; i!=nbTables; i++) {
				const tableName = tableList[i];
				const tableX    = xList[i];
				const tableY    = yList[i]; 
				
				$scope.appendTable(parseInt(tableX), parseInt(tableY), tableName);
				fklist = fklist.concat($scope.getTableFkList(tableName));
			}
			$scope.afterTableUpdate(fklist, null);
		}
	}); 
	
	$scope.showPermalink = function() {
		if(!$rootScope.currentSource ||
			!$scope.tables ||
			$scope.tables.length==0) {
			$scope.graphUrl = null;
			return;
		}
		
		let baseUrl = $location.absUrl();
		const i = baseUrl.indexOf("?");
		if(i > 0) {
			baseUrl = baseUrl.substring(0, i);
		}
		
		let url = baseUrl + "?source=" + $rootScope.currentSource.name;
		
		for(const tableName in $scope.tables) {
			if(!$scope.tables.hasOwnProperty(tableName)) {
				continue;
			}
			
			const tableDiv = document.getElementById($scope.divPrefix+tableName);
			if(tableDiv) {
				url = url + "&table=" + tableName + "&x="+tableDiv.offsetLeft+"&y="+tableDiv.offsetTop;
			}
		}
		
		$scope.graphUrl = url;
		$scope.showGraphUrlDialog();
	}
	
	$scope.resizeJsPlumbContainerIfNecessary = function(width, height) {
		const targetWidth  = width + 200;
		const targetHeight = height + 150;
		
		if($scope.jsplumbContainer.offsetWidth < targetWidth) {
			$scope.jsplumbContainer.style.width = targetWidth+"px";
		} 
		if($scope.jsplumbContainer.offsetHeight < targetHeight) {
			$scope.jsplumbContainer.style.height = targetHeight+"px";
		} 
	}
	
	$scope.updateTablesActualPosition = function() {
		// get the actual position of the tables in the graph
		for(const tableName in $scope.tables) {
			if(!$scope.tables.hasOwnProperty(tableName)) {
				continue;
			}
			
			const tableDiv = document.getElementById($scope.divPrefix+tableName);
			if(tableDiv) {
				const t = $scope.tables[tableName];
				t.x = tableDiv.offsetLeft;
				t.y = tableDiv.offsetTop;
			}
		}
	}

	
	$scope.jsplumbInit();
	$scope.tablesInit();
	$scope.restoreScope();
	
});