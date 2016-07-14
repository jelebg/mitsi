angular.module('mitsiApp')
    .controller('wgraphCtrl', function($scope, $rootScope, $timeout) {

	$scope.jsplumb = null;
	$scope.jsplumbContainer = null;
	$scope.divPrefix = "mitsiObject_";
	$scope.tables = {};
	
	$scope.jsplumbInit = function() {
		$scope.jsplumbContainer = document.getElementById("jsPlumbContainer");
		$scope.jsplumb = jsPlumb.getInstance();
		
		$scope.jsplumb.setContainer($scope.jsplumbContainer);
		jsPlumb.importDefaults({
			  Endpoints : [ [ "Dot", { radius:5 } ], [ "Dot", { radius:5 } ] ]
		});

	}
	

	// TODO : supprimer
	$scope.appendTableNoStacking = function(left, top, tableName, horizontalSide) {
		// TODO : refaire avec un proximity graph
		if($scope.existsTable(tableName)) {
			return;
		}
		
		var bestPlace = $scope.getTableBestPlace(left, top);
		
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
			$scope.jsplumb.draggable(document.querySelectorAll(".linksTable"));
		}, 0);
	}

	
	$scope.getTableBestPlace = function(left, top, horizontalSide) {
		var dx = 40;
		var dy = 40;
		var maxIJ = 4;
		var newLeft = left;
		var newTop = top
		for(var i=1; i!=maxIJ; i++) {
			for(var j=0; j!=i; j++) {
				newLeft = left+horizontalSide*(i-j)*dx;
				if(newLeft<0) {
					newLeft = 0;
				}
				newTop  = top+(j)*dx;
				if($scope.getTableAtXY(newLeft, newTop) == null) {
					return {x:newLeft, y:newTop};
				}
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
				console.log("left="+elt.offsetLeft+",top="+elt.offsetTop+","+
					"width="+elt.offsetWidth+",height="+elt.offsetHeight);
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
	
	$scope.fk = function(from, to, columnsFrom, columnsTo) {
		var autoCycle = (from==to);
		
		if($scope.jsplumb.select({source:$scope.divPrefix+from, target:$scope.divPrefix+to}).length > 0) {
			// TODO : checker qu'on est bien sur les meme champs en récupérant les labels
			//console.log("allready connected : "+from+" to "+to);
			return;
		};
		
		console.log("connect "+from+" to "+to);
		
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
				    	lineWidth:2
				    }
			    	,hoverPaintStyle:{ 
			    		strokeStyle:"black", 
			    	    lineWidth:3
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
			    	lineWidth:2
			    }
		    	,hoverPaintStyle:{ 
		    		strokeStyle:"black", 
		    	    lineWidth:3
		    	}
		    	,endpointStyle:{ 
		    		fillStyle:"lightgrey", 
		    		outlineWidth:1 
		    	}
		    	,anchor: [ "Right", "Left" ]
				,overlays:[ "Arrow", 
					[ "Label", { label:columnsFrom, location:0.2, labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}} ] 
					,[ "Label", { label:columnsTo, location:0.8, labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}} ]
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
			$scope.removeAllTables();
			$scope.displayProximityGraph(tableName);
		}
		
	});
	
	$scope.mouseOverDiv = function() {
		this.showIcons = true;
	}
	$scope.mouseLeaveDiv = function() {
		this.showIcons = false;
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

	
	$scope.removeTable = function(tableName) {
		$scope.jsplumb.remove($scope.divPrefix + tableName);
		delete $scope.tables[tableName];		
	}
	
	$scope.removeAllTables = function() {
		for(var t in $scope.tables) {
			$scope.jsplumb.detachAllConnections($scope.divPrefix + t);
			$scope.jsplumb.removeAllEndpoints($scope.divPrefix + t);
			$scope.jsplumb.remove($scope.divPrefix + t);
		}
		$scope.tables = {};
	}
	
	$scope.displayProximityGraph = function(currentVertexName) {
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
			var r = (i+1)*Math.max(100, maxmax * 30);
			radiu[i] = r;
		}
		var x0 = radiu[depth-1]+100;
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
	
	
	$scope.jsplumbInit();
	$scope.tablesInit();
	
	if($rootScope.currentSource 
			&& $rootScope.currentSource.currentObject 
			&& $rootScope.currentSource.currentObject.id) {
		tableName = $rootScope.currentSource.currentObject.id.schema+"."+$rootScope.currentSource.currentObject.id.name;
		$scope.displayProximityGraph(tableName);
	}
	else {
		$scope.appendTable(100, 100, "O_o");
	
	}
	

});