angular.module('mitsiApp')
    .controller('wgraphCtrl', function($scope, $rootScope, $timeout) {

	$scope.jsplumb = null;
	$scope.jsplumbContainer = null;
	$scope.divPrefix = "mitsiObject_";
	$scope.tables = {};
	$scope.tablesTemporary = [];
	$scope.showProximityGraphTimeoutPromise = null;
	$scope.hideProximityGraphTimeoutPromise = null;
	$scope.sqlTables = [];
	$scope.sqlText = [];

	$scope.TEMPORARY_TABLE_SHOW_TIMEOUT = 1000;
	$scope.TEMPORARY_TABLE_HIDE_TIMEOUT = 1000;
	
	$scope.jsplumbInit = function() {
		$scope.jsplumbContainer = document.getElementById("jsPlumbContainer");
		$scope.jsplumb = jsPlumb.getInstance();
		
		$scope.jsplumb.setContainer($scope.jsplumbContainer);
		jsPlumb.importDefaults({
			  Endpoints : [ [ "Dot", { radius:5 } ], [ "Dot", { radius:5 } ] ]
		});

	}
	

	$scope.appendTableNoStacking = function(left, top, tableName, horizontalSide) {
		if($scope.existsTable(tableName)) {
			return;
		}
		
		var bestPlace = $scope.getTableBestPlace(left, top, horizontalSide);
		
		$scope.appendTable(bestPlace.x, bestPlace.y, tableName);
		
		var fkList = [];
		
		var links = $rootScope.currentSource.mitsiGraph.getLinksByName(tableName);
		if(links) {
			for(var i=0; i!=links.length; i++) {
				var link = links[i];
				rtable = link.targetName;
				if(link.targetName in $scope.tables && tableName in $scope.tables) {
					fkList.push({
						fromTable:tableName,
						fromColumns:link.properties.keyColumns,
						toTable:link.targetName,
						toColumns:link.properties.keyColumns});
				} 
			}
		}
		
		var rlinks = $rootScope.currentSource.mitsiGraph.getReverseLinksByName(tableName);
		if(rlinks) {
			for(var i=0; i!=rlinks.length; i++) {
				var link = rlinks[i];
				rtable2 = $rootScope.currentSource.mitsiGraph.getVertexName(link.target);
				if(rtable2 in $scope.tables && tableName in $scope.tables) {
					fkList.push({
						fromTable:rtable2,
						fromColumns:link.properties.keyColumns,
						toTable:tableName,
						toColumns:link.properties.keyColumns});
				}
			}
		}
		
		$scope.appendFKList(fkList);

	}

	$scope.appendFKList = function(fklist) {
		$timeout(function() {
			for(var i=0; i!=fklist.length; i++) {
				var mafk = fklist[i];
				$scope.fk(mafk.fromTable, mafk.toTable, mafk.fromColumns, mafk.toColumns);
			}
			
			// maybe there is a better place for dragg management
			// TODO : drag selection only if we move the table that we hovered in the first place
			$scope.jsplumb.draggable(document.querySelectorAll(".linksTable"));
			$scope.jsplumb.clearDragSelection();
			for(var i=0; i!=$scope.tablesTemporary.length; i++) {
				$scope.jsplumb.addToDragSelection(document.getElementById($scope.divPrefix+$scope.tablesTemporary[i]));
			}
		}, 0);
	}

	
	$scope.getTableBestPlace = function(left, top) {
		var dx = 40;
		var dy = 40;
		var maxIJ = 10;
		var newLeft = left;
		var maxLeft = 500;
		var newTop = top
		for(var i=0; i<maxIJ; i++) {
			newLeft = left;
			newTop  = top+(i)*dx;

			while(newLeft < maxLeft) {
				var elt = $scope.getTableAtXY(newLeft, newTop);
				if(elt == null) {
					return {x:newLeft, y:newTop};
				}
				newLeft = elt.offsetLeft + elt.offsetWidth + dx;
			}
		}
		return {x:(left+10), y:(top+10)};
	}
	
	$scope.getTableAtXY = function(left, top) {
		var elts = $scope.jsplumbContainer.childNodes;
		var myMargin = 10;
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
	
	$scope.hasTableMissingLinks = function(tableName, checkFrom, checkTo) {
		if(! $scope.currentSource||
				! $scope.currentSource.mitsiGraph) {
			return false;
		}
		
		var linkedTables = null;
		if(checkTo) {
			linkedTables = $scope.currentSource.mitsiGraph.getLinksByName(tableName);
			if(linkedTables != null) {
				for(var i=0; i!=linkedTables.length; i++) {
					var t = linkedTables[i];
					if(! (t.targetName in $scope.tables)) {
						return true;
					}
				}
			}
		}
		
		if(checkFrom) {		
			linkedTables = $scope.currentSource.mitsiGraph.getReverseLinksByName(tableName);
			if(linkedTables != null) {
				for(var i=0; i!=linkedTables.length; i++) {
					var t = linkedTables[i];
					if(! (t.targetName in $scope.tables)) {
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
			//console.log("allready connected : "+from+" to "+to);
			return;
		};
		
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
		
				
				var connection = $scope.jsplumb.connect({
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
				console.log(e);
				throw e;
			}
		}
		else {
			var connection = $scope.jsplumb.connect({
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
		var overlays = connection.getOverlays();
		if(!overlays) {
			return;
		}
		for(var overlayId in overlays) {
			var overlay = overlays[overlayId];
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
	
	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED, function (event, source, databaseObject) {
		var ypos = 0;
		
		if(databaseObject && databaseObject.id) {
			var tableName = databaseObject.id.schema+"."+databaseObject.id.name;
			$scope.appendTableNoStacking(50, 50, tableName);
		}
		
	});
	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED_FOR_PROXIMITY_GRAPH, function (event, source, databaseObject) {
		var ypos = 0;
		
		if(databaseObject && databaseObject.id) {
			var tableName = databaseObject.id.schema+"."+databaseObject.id.name;
			$scope.removeAllTables();
			$scope.displayProximityGraph(tableName);
		}
		
	});
	
	$scope.resetTimeoutPromises = function() {
		if($scope.showProximityGraphTimeoutPromise != null) {
			$timeout.cancel($scope.showProximityGraphTimeoutPromise);
			$scope.showProximityGraphTimeoutPromise = null;
		}
		if($scope.hideProximityGraphTimeoutPromise != null) {
			$timeout.cancel($scope.hideProximityGraphTimeoutPromise);
			$scope.hideProximityGraphTimeoutPromise = null;
		}
	}
	
	$scope.mouseOverDiv = function(table) {
		this.showIcons = true;
		
		$scope.resetTimeoutPromises();

		if($scope.hasTableMissingLinks(table.name, true, true)) {
			
			$scope.showProximityGraphTimeoutPromise = $timeout(function() {
				$scope.displayProximityGraph(table.name, true);
			}, $scope.TEMPORARY_TABLE_SHOW_TIMEOUT);
			
		}
	}
	$scope.mouseLeaveDiv = function() {
		this.showIcons = false;

		$scope.resetTimeoutPromises();
		
		$scope.hideProximityGraphTimeoutPromise = $timeout(function() {
			$scope.hideProximityGraph();
		}, $scope.TEMPORARY_TABLE_HIDE_TIMEOUT);

	}
	
	$scope.tablesInit = function() {
		
		//$scope.jsplumb.deleteEveryEndpoint();;
		// TODO : hum ca ne sert surement à rien tout ça
		$scope.jsplumb.detachEveryConnection();
		for(var t in $scope.tables) {
			$scope.jsplumb.remove($scope.divPrefix + t.name);
		}
		
		$scope.tables = {};
	}

	$scope.appendTable = function(left, top, tableName) {

		if(!(tableName in $scope.tables)) {
			$scope.tables[tableName] = {name:tableName, x:left, y:top };
		}
	}
	
	$scope.existsTable = function(tableName) {
		return ($scope.tables[tableName] !=null);

	}

	
	$scope.removeTable = function(tableName, withTemporary) {
		$scope.jsplumb.remove($scope.divPrefix + tableName);
		delete $scope.tables[tableName];	
		
		if(withTemporary===true) {
			var i = $scope.tablesTemporary.indexOf(tableName);
			if(i >= 0) {
				$scope.tablesTemporary.splice(i, 1);
			}
			$scope.mouseLeaveDiv();
		}

	}
	
	$scope.removeAllTables = function() {
		for(var t in $scope.tables) {
			$scope.jsplumb.detachAllConnections($scope.divPrefix + t);
			$scope.jsplumb.removeAllEndpoints($scope.divPrefix + t);
			$scope.jsplumb.remove($scope.divPrefix + t);
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
		
	}

	$scope.isTableSelected = function(tableName) {
		if(!$rootScope.currentSource) {
			return false;
		}
		var currentObject = $rootScope.currentSource.currentObject
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
			$scope.removeTable($scope.tablesTemporary[i]);
		}
		
		$scope.tablesTemporary = [];
	}
	
	$scope.displayProximityGraph = function(currentVertexName, temporary) {
		var depth = 1;
		var name = currentVertexName;
		var existingTables = [];
		var appendedTables = [];
		
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
			var r = (i+1)*Math.max(170, maxmax * 30);
			radiu[i] = r;
		}
		var x0 = radiu[depth-1]+200;
		var y0 = radiu[depth-1]+50;
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
		for(var i=0; i!=depth; i++) {
			for(var j=0; j!=proximityGraph.before[i].length; j++) {
				var index = proximityGraph.before[i][j];
				var vertexName = graph.getVertexName(index);
				if(vertexName in $scope.tables) {
					existingTables.push(vertexName);
				}
				else {
					$scope.appendTable( 
							Math.max(0, x0-radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.before[i].length+3))), 
							Math.max(0, y0-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.before[i].length+3))), 
							vertexName);
					if(temporary===true) {
						$scope.tablesTemporary.push(vertexName);
					}
					appendedTables.push(vertexName);
				}
			}
			for(var j=0; j!=proximityGraph.after[i].length; j++) {
				var index = proximityGraph.after[i][j];
				var vertexName = graph.getVertexName(index);
				if(vertexName in $scope.tables) {
					existingTables.push(vertexName);
				}
				else {
					$scope.appendTable( 
							Math.max(0, x0+80+radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.after[i].length+3))), 
							Math.max(0, y0+40-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.after[i].length+3))), 
							vertexName);
					if(temporary===true) {
						$scope.tablesTemporary.push(vertexName);
					}
					appendedTables.push(vertexName);
				}
			}
		}
		
		// append links between tables
		// TODO : verifier qu'on n'ajoute pas deux fois la même FK
		var fklist = [];
		$scope.appendVertexLinks(graph, fklist, graph.getVertex(currentVertexIndex), existingTables);
		for(var i=0; i!=depth; i++) {
			for(var j=0; j!=proximityGraph.before[i].length; j++) {
				var index = proximityGraph.before[i][j];
				var vertex = graph.getVertex(index);
				$scope.appendVertexLinks(graph, fklist, vertex, existingTables);
			}
			for(var j=0; j!=proximityGraph.after[i].length; j++) {
				var index = proximityGraph.after[i][j];
				var vertex = graph.getVertex(index);
				$scope.appendVertexLinks(graph, fklist, vertex, existingTables);
			}
		}
		
		$scope.appendFKList(fklist);
	}
	
	$scope.appendVertexLinks = function(graph, fklist, vertex, existingTables) {
		//var missingLinks = []; // TODO : lue seulement. a supprimer ?
		
		for(var i=0; i!=vertex.links.length; i++) {
			var l = vertex.links[i];
			var targetVertexName = graph.getVertexName(l.target);
			
			//if($scope.existsTable(targetVertexName)==null) {
			//	missingLinks.push(targetVertexName);
			//}
			//else {
			if(existingTables.indexOf(vertex.name) == -1 || existingTables.indexOf(targetVertexName) == -1) {
				if(vertex.name in $scope.tables && targetVertexName in $scope.tables) {
					fklist.push({
						fromTable:vertex.name,
						fromColumns:l.properties.keyColumns,
						toTable:targetVertexName,
						toColumns:l.properties.rKeyColumns});
				}
			}
		}

		for(var i=0; i!=vertex.reverseLinks.length; i++) {
			var l = vertex.reverseLinks[i];
			var targetVertexName = graph.getVertexName(l.target);
			
			//if($scope.existsTable(targetVertexName)==null) {
			//	missingLinks.push(targetVertexName);
			//}
			//else {
			if(existingTables.indexOf(vertex.name) == -1 || existingTables.indexOf(targetVertexName) == -1) {
				if(vertex.name in $scope.tables && targetVertexName in $scope.tables) {
					fklist.push({
						fromTable:targetVertexName,
						fromColumns:l.properties.keyColumns,
						toTable:vertex.name,
						toColumns:l.properties.rKeyColumns});
				}
			}
		}
	}
	
	$scope.removeAllTablesInSQL = function() {
		$scope.sqlTables = [];
		$scope.updateSQLText();
	}
	
	$scope.toggleTableInSQL = function(table) {
		var i = $scope.sqlTables.indexOf(table.name);
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
	}
	
	$scope.isTableInSQL = function(table) {
		return $scope.sqlTables.indexOf(table.name) != -1;
	}
	
	$scope.updateSQLText = function() {
		$scope.sqlText = "";
		if($scope.sqlTables.length == 0) {
			return;
		}
		
		var connectedSubGroups = $scope.getConnectedSubGroups($scope.sqlTables);
		$scope.sqlText = [];
		
		if(connectedSubGroups.length > 1) {
			$scope.sqlText.push("/!\\ not all tables connected together /!\\");
		}
		for(var i=0; i!=connectedSubGroups.length; i++) {
			var subGroup = connectedSubGroups[i];
			
			for(var j=0; j!=subGroup.length; j++) {
				var link=subGroup[j];
				if(link.found=="none_first" || link.found=="isolate") {
					$scope.sqlText.push((i==0 ? "FROM" : ",")+" "+link.fromName);
				}
				if(link.found!="isolate") {
					$scope.sqlText.push(
							  "join "+(link.found=="to"?link.fromName:link.toName)
							+ " on "
							+ $scope.getJoinConditionFromFKs(link.fromName, link.toName, link.fromKeyColumns, link.toKeyColumns)
							);
				}
				
			}
		}
	}
	
	$scope.getJoinConditionFromFKs = function(fromName, toName, fromKeyColumns, toKeyColumns) {
		var froms = fromKeyColumns.split("\n");
		var tos = toKeyColumns.split("\n");
		
		var condition = "";

		if(froms.length > 1) {
			var first = true;
			for(var i=0; i!=froms.length; i++) {
				condition = condition 
						+ (first==false ? " or " : "")
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
		var froms = fromKeyColumns.split(",");
		var tos = toKeyColumns.split(",");
		
		var condition = "";
		var first = true;
		for(var i=0; i!=froms.length; i++) {
			if(first == true) {
				first = false;
			}
			else {
				condition = condition + " and ";
			}
			condition = condition + fromName + "." + froms[i] + " = " + toName + "." + tos[i];
		}
		
		return condition;
	}
	
	$scope.getConnectedSubGroups = function(tableNames) {
		var graph = $scope.currentSource.mitsiGraph;
		var links = [];
		var currentSubGroup = [];
		var subGroups = [];
		var tablesWithLinks = {};
		
		for(var i=0; i!=tableNames.length; i++) {
			var tableName = tableNames[i];
			var vertexConnections = graph.getLinksByName(tableName);
			for(var j=0; j!=vertexConnections.length; j++) {
				var vertexConnection = vertexConnections[j];
				var targetName = vertexConnection.targetName;
				
				// ignore auto-loop 
				if(targetName==tableName) {
					continue;
				}
				
				// ignore where link does not concern one of the selected tables
				if(tableNames.indexOf(targetName) == -1) {
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
		
		var allDone = false;
		var nothingFoundThisLoop = false;
		var currentSubGroupTables = [];
		while(allDone == false) {
			allDone = true;
			nothingFoundThisLoop = true;
			for(var i=0; i!=links.length; i++) {
				var link = links[i]
				if(link.done == true) {
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
					nothingFoundThisLoop = false;
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
			
			if(nothingFoundThisLoop == true && allDone==false) {
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
		for(var i=0; i!=tableNames.length; i++) {
			var tableName = tableNames[i];
			if( ! (tableName in tablesWithLinks)) {
				subGroups.push( [ { fromName:tableName, toName:null, found:"isolate" } ] );
			}
		}
		
		return subGroups;
		
	}
	
	$scope.requestInfo = function(object) {
        $rootScope.$broadcast(EVENT_DATABASE_OBJECT_INFO_REQUESTED, $rootScope.currentSource, object);
	}
	
	
	
	
	$scope.jsplumbInit();
	$scope.tablesInit();
	
	if($rootScope.currentSource 
			&& $rootScope.currentSource.currentObject 
			&& $rootScope.currentSource.currentObject.id) {
		tableName = $rootScope.currentSource.currentObject.id.schema+"."+$rootScope.currentSource.currentObject.id.name;
		$scope.displayProximityGraph(tableName);
	}
	

});