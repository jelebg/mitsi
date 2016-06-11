angular.module('mitsiApp')
    .controller('wgraphCtrl', function($scope, $rootScope, $timeout) {

	$scope.mya = true;
	$scope.tutu = "wgraph";
	$scope.jsplumb = null;
	$scope.jsplumbContainer = null;
	$scope.divPrefix = "mitsiObject_";
	$scope.mestables = { tlist:[] };
	$scope.mestablesNames = [];
	
	$scope.jsplumbInit = function() {
		$scope.jsplumbContainer = document.getElementById("jsPlumbContainer");
		//jsPlumb.setContainer($scope.jsplumbContainer);
		$scope.jsplumb = jsPlumb.getInstance();
		//$scope.jsplumbContainer.innerHTML = "";
		
		$scope.jsplumb.setContainer($scope.jsplumbContainer);
		//$scope.jsplumb = jsPlumb.getInstance();
		//$scope.jsplumb.empty($scope.jsplumbContainer.id);
		jsPlumb.importDefaults({
			  Endpoints : [ [ "Dot", { radius:5 } ], [ "Dot", { radius:5 } ] ]
		});

	}
	
	$scope.jsplumbReinit = function() {
		//$scope.jsplumb.empty($scope.jsplumbContainer.id);
		$scope.jsplumb.detachEveryConnection();
		if($scope.mestables.tlist == null) {
			return;
		}
		for(var i=0; i!=$scope.mestables.tlist.length; i++) {
			$scope.jsplumb.remove($scope.divPrefix + $scope.mestables.tlist[i].name);
		}
		
	}
	
	$scope.appendTableNoStacking = function(left, top, tableName, horizontalSide) {
		//var xy = getAbsoluteXY($scope.jsplumbContainer)
		//var elt = document.elementFromPoint(left+xy.x, top+xy.y);
		//console.log(elt.className);
		//$scope.mestables.tlist.push({ name:tableName, x:350, y:150 });

		// TODO mestablesName
		for(var i=0; i!=$scope.mestables.tlist.length; i++) {
			var t = $scope.mestables.tlist[i];
			if(t.name == tableName) {
				return;
			}
		}
		
		var bestPlace = $scope.getTableBestPlace(left, top);
		
		//$scope.mestables.tlist.push({ name:tableName, x:bestPlace.x, y:bestPlace.y });
		//$scope.mestablesName.push(tableName);
		$scope.appendTable(bestPlace.x, bestPlace.y, tableName);
		
		var fkList = [];
		
		var links = $rootScope.currentSource.mitsiGraph.getLinksByName(tableName);
		if(links) {
			for(var i=0; i!=links.length; i++) {
				var link = links[i];
				rtable = link.targetName;
				fkList.push({
					fromTable:tableName,
					fromColumns:link.properties.keyColumns,
					toTable:link.targetName,
					toColumns:link.properties.keyColumns});
				//break;
			}
		}
		
		var rlinks = $rootScope.currentSource.mitsiGraph.getReverseLinksByName(tableName);
		if(rlinks) {
			for(var i=0; i!=rlinks.length; i++) {
				var link = rlinks[i];
				rtable2 = $rootScope.currentSource.mitsiGraph.getVertexName(link.target);
				fkList.push({
					fromTable:rtable2,
					fromColumns:link.properties.keyColumns,
					toTable:tableName,
					toColumns:link.properties.keyColumns});
				//break;
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
	
	/*$scope.appendTable = function(left, top, name) {
		var d = document.createElement("DIV");
		d.id = $scope.divPrefix+name;
		d.className = "linksTable";
		
		var t = document.createElement("TABLE");
		var tr1 = document.createElement("TR");
		var tr2 = document.createElement("TR");
		tr1.colspan = 5;
		t.appendChild(tr1);
		t.appendChild(tr2);
		d.appendChild(t);
			
		var td11 = document.createElement("TD");
		tr1.appendChild(td11);
		//var a = document.createElement("A");
		//a.href = "";
		//var img = document.createElement("IMG");
		//img.src = "img/drilldown.png";
		var text = document.createTextNode(name);
		//d.textContent = name;
		//a.appendChild(img);
		//a.appendChild(text);
		//d.appendChild(a);
		//td11.appendChild(a);
		td11.appendChild(text);
		
		var td21 = document.createElement("TD");
		tr2.appendChild(td21);
		//this.appendTableIcon(td21, name, "img/proxgraph.png", "show links from this table", function(event, vertexName) { othis.gotoVertex(vertexName); } , "" );
		//this.appendTableIcon(td21, name, "img/pathfrom.png", "find path from this table", function(event, vertexName) { othis.setPathFrom(vertexName); } , "" );
		//this.appendTableIcon(td21, name, "img/pathto.png", "find path to this table", function(event, vertexName) { othis.setPathTo(vertexName); } , "" );
		/*$scope.appendTableIcon(td21, name, "img/flag.png", "find path to this table", function(event, vertexName) { othis.setPathTo(vertexName); } , "" );
		$scope.appendTableIcon(td21, name, "img/plus.png", "add linked table", function(event, vertexName) { othis.addLinkedTable(div, td21, vertexName); } , "" );
		$scope.appendTableIcon(td21, name, "img/table.png", "show table content", null, othis.getTableUrl(name) );
		$scope.appendTableIcon(td21, name, "img/details.png", "show table details", null, nullothis.getDetailsUrl(name) );
		$scope.appendTableIcon(td21, name, "img/greycross.png", "hide table", function(event, vertexName) { othis.hideTable(vertexName); } , "" );
		*/
		/*a.onclick = function(event) {
			try {
				$scope.gotoVertex(name);
			}
			catch (e) {
				console.log(e);
			}
			return false;
		}* /

		
		
		//d.draggable = true;
		//d.ondragstart = function(event) { dragstart(event); };
		
		d.style.position = "absolute";
		d.style.left = left+"px";
		d.style.top = top+"px";
		
		$scope.jsplumbContainer.appendChild(d);
	}	*/
	
	/*$scope.appendTableIcon = function(thediv, vertexName, imgsrc, title, fonclick, url ) {
		var img = document.createElement("IMG");
		var a = document.createElement("A");
		img.src = imgsrc;
		img.style.height = "16px";
		a.title = title;
		a.href = url;
		if(fonclick) {
			a.onclick = function(event) {
				try {
					fonclick(event, vertexName);
				}
				catch (e) {
					console.log(e);
				}
				return false;
				
			}
		}
		a.appendChild(img);
		thediv.appendChild(a);
	}*/
	
	$scope.fk = function(from, to, columnsFrom, columnsTo) {
		// TODO : perf a revoir
		/*var fromExists = false;
		var toExists   = false;
		for(var i=0; i!=$scope.mestables.tlist.length; i++) {
			var table = $scope.mestables.tlist[i];
			if(table.name == from) {
				fromExists = true;
			}
			if(table.name == to) {
				toExists = true;
			}
		}*/
		/*if(!fromExists || !toExists) {
			console.log("cannot connect '"+from+"' and '"+to+"'");
		}
		console.log("connecting '"+from+"' and '"+to+"'");*/
		
		var autoCycle = (from==to);
		//if(autoCycle) {
		//	console.log("from:"+from+" = to:"+to);
		//}
		
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
					/*,source:$scope.divPrefix+from,
					target:$scope.divPrefix+to*/
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
			    	/*,anchor: [ "RightMiddle", "TopCenter" ]*/
			    	//,connector: [ "Flowchart", { cornerRadius:70 } ]
			    	,connector: [ "StateMachine" ]
					,overlays:[ "Arrow", 
						[ "Label", { label:columnsFrom, location:0.1, labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}} ] 
						,[ "Label", { label:columnsTo, location:0.7, labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}} ]
					  ]
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
			});
		}
		if(connection) {
			$scope.displayAllLabelsOnConnection(connection, false);
	
			connection.bind("mouseover", function(conn) {
			    //console.log("you overed ", conn);
				$scope.displayAllLabelsOnConnection(conn, true);
			});
			connection.bind("mouseout", function(conn) {
			    //console.log("you outed ", conn);
				//conn.setLabel("");
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
				//console.log("label:"+overlay.label);
				if(display) {
					connection.showOverlay(overlayId) ;
				}
				else {
					connection.hideOverlay(overlayId) ;
				}
			}
		}

	}
	
	$scope.$on('DabaseObjectSelected', function (event, source, databaseObject) {
		$scope.jsplumbReinit();
		var ypos = 0;
		
		if(databaseObject && databaseObject.id) {
			var tableName = databaseObject.id.schema+"."+databaseObject.id.name;
			$scope.removeAllTables();
			$scope.displayProximityGraph(tableName);
		}
		
			/* var fkList = [];
			var rtable = null;
			var rtable2 = null;
			
			$scope.mestables = { tlist:[ 
			            				{ name:tableName, x:"200", y:"200" }
			            		]};		
			$scope.mestablesName = [ tableName ];

			var links = source.mitsiGraph.getLinksByName(databaseObject.id.schema, databaseObject.id.name);
			if(links) {
				for(var i=0; i!=links.length; i++) {
					var link = links[i];
					rtable = link.targetName;
					fkList.push({
						fromTable:tableName,
						fromColumns:link.properties.keyColumns,
						toTable:link.targetName,
						toColumns:link.properties.keyColumns});
					//break;
					$scope.appendTable(350, 50+ypos*50, rtable);
					//$scope.mestables.tlist.push({ name:rtable, x:"350", y:""+(50+ypos*50) });
					//$scope.mestablesName.push(rtable);
					ypos++;
				}
			}
			
			var rlinks = source.mitsiGraph.getReverseLinksByName(databaseObject.id.schema, databaseObject.id.name);
			if(rlinks) {
				for(var i=0; i!=rlinks.length; i++) {
					var link = rlinks[i];
					rtable2 = source.mitsiGraph.getVertexName(link.target);
					fkList.push({
						fromTable:rtable2,
						fromColumns:link.properties.keyColumns,
						toTable:tableName,
						toColumns:link.properties.keyColumns});
					//break;
					$scope.appendTable(50, 50+ypos*50, rtable2);
					//$scope.mestables.tlist.push({ name:rtable2, x:"50", y:""+(50+ypos*50) });
					//$scope.mestablesName.push(rtable2);
					ypos++;
				}
			}
		}*/
		/*if(rtable) {
			$scope.mestables.tlist.push({ name:rtable, x:"150", y:"150" });
			$scope.mestablesName.push(rtable);
		}
		if(rtable2) {
			$scope.mestables.tlist.push({ name:rtable2, x:"50", y:"50" });
			$scope.mestablesName.push(rtable2);
		}*/
		
		/*var links = source.mitsiGraph.getLinksByName(databaseObject.id.schema, databaseObject.id.name);
		if(links) {
			for(var i=0; i!=links.length; i++) {
				var link = links[i];
				rtable = link.targetName;
				fkList.push({
					fromTable:tableName,
					fromColumns:link.properties.keyColumns,
					toTable:link.targetName,
					toColumns:link.properties.keyColumns});
				break;
			}
		}
		
		var rlinks = source.mitsiGraph.getReverseLinksByName(databaseObject.id.schema, databaseObject.id.name);
		if(rlinks) {
			for(var i=0; i!=rlinks.length; i++) {
				var link = rlinks[i];
				rtable2 = source.mitsiGraph.getVertexName(link.target);
				fkList.push({
					fromTable:rtable2,
					fromColumns:link.properties.keyColumns,
					toTable:tableName,
					toColumns:link.properties.keyColumns});
				break;
			}
		}*/
		
		//$scope.appendFKList(fkList);
		/*$timeout(function() {
			for(var i=0; i!=$scope.fklist.length; i++) {
				var mafk = $scope.fklist[i];
				$scope.fk(mafk.fromTable, mafk.toTable, mafk.fromColumns, mafk.toColumns);
			}
			$scope.jsplumb.draggable(document.querySelectorAll(".linksTable"));
		}, 0);*/

	});
	
	$scope.mouseOverDiv = function() {
		this.showIcons = true;
	}
	$scope.mouseLeaveDiv = function() {
		this.showIcons = false;
	}

	$scope.appendTable = function(left, top, tableName) {
		$scope.mestables.tlist.push({name:tableName, x:left, y:top });
		$scope.mestablesName.push(tableName);
	}
	
	$scope.existsTable = function(tableName) {
		return ($scope.mestablesName.indexOf(tableName) >= 0);

	}

	
	$scope.removeTable = function(tableName) {
		$scope.jsplumb.remove($scope.divPrefix + tableName);
		
		// TODO perf : faire un associative array
		for(var i=0; i!=$scope.mestables.tlist.length; i++) {
			if($scope.mestables.tlist[i].name == tableName) {
				$scope.mestables.tlist.splice(i, 1);
				$scope.mestablesName.splice(i, 1);
				break;
			}
		}

	}
	
	$scope.removeAllTables = function() {
		//for(i=$scope.mestablesName.length; i>=0; i--) {
		for(i=0; i!=$scope.mestablesName.length; i++) {
			var tableName = $scope.mestablesName[i];
			$scope.jsplumb.remove($scope.divPrefix + tableName);
		}
		$scope.mestables.tlist = [];
		$scope.mestablesName = [];
	}
	
	$scope.displayProximityGraph = function(currentVertexName) {
		var depth = 1;
		var name = currentVertexName;
		
		var graph = $rootScope.currentSource.mitsiGraph
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
			var r = (i+1)*Math.max(250, maxmax * 50);
			radiu[i] = r;
		}
		var x0 = radiu[depth-1];
		var y0 = radiu[depth-1];
		
		// append tables
		$scope.appendTable(x0+40, y0+20, name);
		for(var i=0; i!=depth; i++) {
			for(var j=0; j!=proximityGraph.before[i].length; j++) {
				var index = proximityGraph.before[i][j];
				var vertexName = graph.getVertexName(index);
				//appendTable(x0+dx*(depth-i-1), y0+dy*j, vertexName);
				$scope.appendTable( 
						x0-radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.before[i].length+3)), 
						y0-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.before[i].length+3)), 
						vertexName);
			}
			for(var j=0; j!=proximityGraph.after[i].length; j++) {
				var index = proximityGraph.after[i][j];
				var vertexName = graph.getVertexName(index);
				//appendTable(x0+dx*(i+depth+1), y0+dy*j, vertexName);
				$scope.appendTable( 
						x0+80+radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.after[i].length+3)), 
						y0+40-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.after[i].length+3)), 
						vertexName);
			}
		}
		
		// append links between tables
		var fklist = [];
		$scope.appendVertexLinks(graph, fklist, graph.getVertex(currentVertexIndex));
		for(var i=0; i!=depth; i++) {
			for(var j=0; j!=proximityGraph.before[i].length; j++) {
				var index = proximityGraph.before[i][j];
				var vertex = graph.getVertex(index);
				$scope.appendVertexLinks(graph, fklist, vertex);
			}
			for(var j=0; j!=proximityGraph.after[i].length; j++) {
				var index = proximityGraph.after[i][j];
				var vertex = graph.getVertex(index);
				$scope.appendVertexLinks(graph, fklist, vertex);
			}
		}
		
		$scope.appendFKList(fklist);
	}
	
	$scope.appendVertexLinks = function(graph, fklist, vertex) {
		var missingLinks = []; 
		
		for(var i=0; i!=vertex.links.length; i++) {
			var l = vertex.links[i];
			var targetVertexName = graph.getVertexName(l.target);
			
			if($scope.existsTable(targetVertexName)==null) {
				missingLinks.push(targetVertexName);
			}
			else {
				//fk(vertex.name, targetVertexName, l.properties.keyColumns, l.properties.rKeyColumns);
				fklist.push({
						fromTable:vertex.name,
						fromColumns:l.properties.keyColumns,
						toTable:targetVertexName,
						toColumns:l.properties.rKeyColumns});
			}
		}

		for(var i=0; i!=vertex.reverseLinks.length; i++) {
			var l = vertex.reverseLinks[i];
			var targetVertexName = graph.getVertexName(l.target);
			
			if($scope.existsTable(targetVertexName)==null) {
				missingLinks.push(targetVertexName);
			}
			else {
				//fk(targetVertexName, vertex.name, l.properties.keyColumns, l.properties.rKeyColumns);
				fklist.push({
					fromTable:targetVertexName,
					fromColumns:l.properties.keyColumns,
					toTable:vertex.name,
					toColumns:l.properties.rKeyColumns});
			}
		}
		
		/*if(missingLinks.length>0) {
			gid(divPrefix+vertex.name).title = "not displayed here : links to "+Array.join(missingLinks, ", ");
		}
		else {
			gid(divPrefix+vertex.name).title = "all links displayed for this table";
		}*/
	}
	
	
	$scope.jsplumbInit();
	$scope.mestables.tlist = [];
	$scope.mestablesName = [] ;
	
	//$scope.mestables = { tlist:[ {name:"COUCOU", x:"200", y:"200"},
	//                            {name:"BLABLA", x:"250", y:"300"} ]
	//	};
	var tableName = "saispas";
	if($rootScope.currentSource 
			&& $rootScope.currentSource.currentObject 
			&& $rootScope.currentSource.currentObject.id) {
		tableName = $rootScope.currentSource.currentObject.id.schema+"."+$rootScope.currentSource.currentObject.id.name;
		$scope.displayProximityGraph(tableName);
	}
	else {
		$scope.appendTable(100, 100, "O_o");
	
		//$timeout(function() {
		//	$scope.jsplumb.draggable(document.querySelectorAll(".linksTable"));
		//}, 0);
	}
	

});