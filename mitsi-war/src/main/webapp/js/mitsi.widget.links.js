//// widget to configure shortes path algorithms

var shortesPathMethod = {
	shortestWithDijkstra	:0,
	allShortestWithEppstein	:1,
	kShortestWithEppstein	:2,
	kShortestWithDFS    	:3,
	allWithDFS				:4
};

function MitsiLinksConfiguration(div) {
	this.addPathMethodOption = function(s, value, text, selected) {
		var o = document.createElement("OPTION");
		o.value = value;
		o.text  = text;
		if(selected) {
			o.selected = true;
		}

		s.appendChild(o);
	}

	this.pathMethodSelect = document.createElement("SELECT");
	this.addPathMethodOption(this.pathMethodSelect, shortesPathMethod.shortestWithDijkstra, "single shortest path", false);
	this.addPathMethodOption(this.pathMethodSelect, shortesPathMethod.allShortestWithEppstein, "shortest paths (many if length is equal)", false);
	this.addPathMethodOption(this.pathMethodSelect, shortesPathMethod.kShortestWithEppstein, "K-shortest paths (Eppstein version)", false);
	this.addPathMethodOption(this.pathMethodSelect, shortesPathMethod.kShortestWithDFS, "K-shortest paths (DFS version)", false);
	this.addPathMethodOption(this.pathMethodSelect, shortesPathMethod.allWithDFS, "All possible paths", true);
	this.pathMethodSelect.style.marginRight = "10px";

	this.kInput = document.createElement("INPUT");
	this.kInput.style.width = "20px";
	this.kInput.value = "3";
	this.onChange = null;

	div.appendChild(this.pathMethodSelect);
	div.appendChild(document.createTextNode("k="));
	div.appendChild(this.kInput);
	
	var othis = this;
	this.pathMethodSelectOnchange = function(event) {
		var newValue = othis.pathMethodSelect.options[othis.pathMethodSelect.selectedIndex].value;
		if(newValue==shortesPathMethod.kShortestWithDFS ||
			newValue==shortesPathMethod.kShortestWithEppstein ) {
			othis.kInput.disabled = false;
		}
		else {
			othis.kInput.disabled = true;
		}
	}
	this.pathMethodSelectOnchange(null);
	
	this.getMethod = function() {
		return parseInt(this.pathMethodSelect.options[this.pathMethodSelect.selectedIndex].value);
	}
	
	this.getK = function() {
		return parseInt(this.kInput.value);
	}
	
	this.kInput.onchange = function()  {
		othis.changed();
	}
	this.pathMethodSelect.onchange = function() {
		othis.pathMethodSelectOnchange();
		othis.changed();
	}
	
	this.changed = function() {
		if(this.onChange) {
			this.onChange();
		}
	}
	
	this.setOnChange = function(onChange) {
		this.onChange = onChange;
	}
}


//// widget to draw relation graph

function MitsiLinksGraph(div) {
	this.divPrefix = "mitsiObject_";
	this.div = div;
	this.divMessage = null;
	this.divPaths = null;
	this.currentDatasourceName = null;
	this.currentVertexName = null;
	
	this.message = null;
	this.relations = null;
	this.graph = null;
	this.depth = 1;
	
	this.jsplumb = null;
	
	var othis = this;
	
	this.setCurrent = function(datasourceName, owner, objectName) {
			
		var reload = false;
		if(this.currentDatasourceName == null || 
			this.currentDatasourceName!=datasourceName ||
			this.graph == null) {
			reload = true;
		}
			
		this.currentDatasourceName = datasourceName;
		this.currentVertexName = owner+"."+objectName;
		if(reload) {
			// reload graph, change object later
			this.load();
		}
		else {
			// we already have the graph, change the object now
			this.draw();
			if(this.linksPaths) {
				this.linksPaths.highlightCurrentPaths();
			}
		}
		
	}
	
	this.load = function() {
		callGsonServlet("GetAllRelationsServlet", 
			{
				"datasourceName" : this.currentDatasourceName
			},
			function(response) { 
				console.log(response);
				othis.message = response.message;
				othis.relations = response.relations;
				if(othis.relations) {
					othis.graph = new MitsiGraph(othis.relations);
				}
				else {
					othis.graph = null;
				}
				othis.draw();
				if(othis.linksPaths) {
					othis.linksPaths.update();
				}
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);
		
	}
	
	this.draw = function() {
		this.div.innerHTML = "";
		
		jsPlumb.setContainer(this.div);
		this.jsplumb = jsPlumb.getInstance();
		this.jsplumb.empty(this.div.id);
		jsPlumb.importDefaults({
			  Endpoints : [ [ "Dot", { radius:5 } ], [ "Dot", { radius:5 } ] ]
		});
		
		this.div.ondrop = function(event) { dragend(event); };
		this.div.ondragover = function(event) { allowDrop(event); };
		
		var name = this.currentVertexName;
		var currentVertexIndex = this.graph.getIndex(this.currentVertexName);
		
		var proximityGraph = this.graph.getProximityGraph(currentVertexIndex, this.depth);

		var radiu = [];
		
		// compute radius considering the max number of linked tables for each level, before or after 
		var maxmax = 0;
		for(var i=0; i!=this.depth; i++) {
			var max = Math.max(proximityGraph.before[i].length , proximityGraph.after[i].length);
			if(max > maxmax) {
				maxmax = max;
			}
			var r = (i+1)*Math.max(250, maxmax * 50);
			radiu[i] = r;
		}
		var x0 = radiu[this.depth-1];
		var y0 = radiu[this.depth-1];
		
		// append tables
		this.appendTable( x0+40, y0+20, name);
		for(var i=0; i!=this.depth; i++) {
			for(var j=0; j!=proximityGraph.before[i].length; j++) {
				var index = proximityGraph.before[i][j];
				var vertexName = this.graph.getVertexName(index);
				//appendTable(content, x0+dx*(depth-i-1), y0+dy*j, vertexName);
				this.appendTable(
						x0-radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.before[i].length+3)), 
						y0-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.before[i].length+3)), 
						vertexName);
			}
			for(var j=0; j!=proximityGraph.after[i].length; j++) {
				var index = proximityGraph.after[i][j];
				var vertexName = this.graph.getVertexName(index);
				//appendTable(content, x0+dx*(i+depth+1), y0+dy*j, vertexName);
				this.appendTable(
						x0+80+radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.after[i].length+3)), 
						y0+40-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.after[i].length+3)), 
						vertexName);
			}
		}
		
		// append links between tables
		this.appendLinks(this.graph.getVertex(currentVertexIndex));
		for(var i=0; i!=this.depth; i++) {
			for(var j=0; j!=proximityGraph.before[i].length; j++) {
				var index = proximityGraph.before[i][j];
				var vertex = this.graph.getVertex(index);
				this.appendLinks(vertex);
			}
			for(var j=0; j!=proximityGraph.after[i].length; j++) {
				var index = proximityGraph.after[i][j];
				var vertex = this.graph.getVertex(index);
				this.appendLinks(vertex);
			}
		}
			
		this.jsplumb.draggable(document.querySelectorAll(".linksTable"));
	}
	
	this.appendTableIcon = function(thediv, vertexName, imgsrc, title, fonclick, url ) {
		var img = document.createElement("IMG");
		var a = document.createElement("A");
		img.src = imgsrc
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
	}
	
	this.appendTable = function(left, top, name) {
		var d = document.createElement("DIV");
		d.id = this.divPrefix+name;
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
		var a = document.createElement("A");
		a.href = "";
		//var img = document.createElement("IMG");
		//img.src = "img/drilldown.png";
		var text = document.createTextNode(name);
		//d.textContent = name;
		//a.appendChild(img);
		a.appendChild(text);
		//d.appendChild(a);
		td11.appendChild(a);
		
		var td21 = document.createElement("TD");
		tr2.appendChild(td21);
		//this.appendTableIcon(td21, name, "img/proxgraph.png", "show links from this table", function(event, vertexName) { othis.gotoVertex(vertexName); } , "" );
		//this.appendTableIcon(td21, name, "img/pathfrom.png", "find path from this table", function(event, vertexName) { othis.setPathFrom(vertexName); } , "" );
		//this.appendTableIcon(td21, name, "img/pathto.png", "find path to this table", function(event, vertexName) { othis.setPathTo(vertexName); } , "" );
		this.appendTableIcon(td21, name, "img/flag.png", "find path to this table", function(event, vertexName) { othis.setPathTo(vertexName); } , "" );
		this.appendTableIcon(td21, name, "img/plus.png", "add linked table", function(event, vertexName) { othis.addLinkedTable(div, td21, vertexName); } , "" );
		this.appendTableIcon(td21, name, "img/table.png", "show table content", null, othis.getTableUrl(name) );
		this.appendTableIcon(td21, name, "img/details.png", "show table details", null, othis.getDetailsUrl(name) );
		this.appendTableIcon(td21, name, "img/greycross.png", "hide table", function(event, vertexName) { othis.hideTable(vertexName); } , "" );
		

		a.onclick = function(event) {
			try {
				othis.gotoVertex(name);
			}
			catch (e) {
				console.log(e);
			}
			return false;
		}

		
		
		d.draggable = true;
		d.ondragstart = function(event) { dragstart(event); };
		
		d.style.position = "absolute";
		d.style.left = left+"px";
		d.style.top = top+"px";
		
		this.div.appendChild(d);
	}	
	
	this.appendLinks = function(vertex) {
		var missingLinks = []; 
		
		for(var i=0; i!=vertex.links.length; i++) {
			var l = vertex.links[i];
			var targetVertexName = this.graph.getVertexName(l.target);
			
			if(gid(this.divPrefix+targetVertexName)==null) {
				missingLinks.push(targetVertexName);
			}
			else {
				this.fk(vertex.name, targetVertexName, l.properties.keyColumns, l.properties.rKeyColumns);
			}
		}

		for(var i=0; i!=vertex.reverseLinks.length; i++) {
			var l = vertex.reverseLinks[i];
			var targetVertexName = this.graph.getVertexName(l.target);
			
			if(gid(this.divPrefix+targetVertexName)==null) {
				missingLinks.push(targetVertexName);
			}
			else {
				this.fk(targetVertexName, vertex.name, l.properties.keyColumns, l.properties.rKeyColumns);
			}
		}
		
		if(missingLinks.length>0) {
			gid(this.divPrefix+vertex.name).title = "not displayed here : links to "+Array.join(missingLinks, ", ");
		}
		else {
			gid(this.divPrefix+vertex.name).title = "all links displayed for this table";
		}
	}
	
	this.fk = function(from, to, columnsFrom, columnsTo) {
		var autoCycle = (from==to);
		//if(autoCycle) {
		//	console.log("from:"+from+" = to:"+to);
		//}
		
		if(autoCycle) {
			try {
				this.jsplumb.addEndpoint(this.divPrefix+from, 
						{
				            endpoint: "Dot",
				            paintStyle:{ 
						    	strokeStyle:"lightgrey", 
						    	lineWidth:2,
						    	radius:5
						    },
				            isSource: true
				        }, 
						{ anchor: "RightMiddle", uuid: this.divPrefix+from+"FromUUID" }
					);
				this.jsplumb.addEndpoint(this.divPrefix+to, 
						{
				            endpoint: "Dot",
				            paintStyle:{ 
						    	strokeStyle:"lightgrey", 
						    	lineWidth:2,
						    	radius:5
						    },
				            isTarget: true
				        }, 
						{ anchor: "TopCenter", uuid: this.divPrefix+to+"ToUUID" }
					);
		
				
				var connection = this.jsplumb.connect({
					uuids : [ this.divPrefix+to+"ToUUID", this.divPrefix+from+"FromUUID" ]
					/*source:this.divPrefix+from,
					target:this.divPrefix+to
				    */,paintStyle:{ 
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
			var connection = this.jsplumb.connect({
				source:this.divPrefix+from,
				target:this.divPrefix+to
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
		this.displayAllLabelsOnConnection(connection, false);

		connection.bind("mouseover", function(conn) {
		    //console.log("you overed ", conn);
			othis.displayAllLabelsOnConnection(conn, true);
		});
		connection.bind("mouseout", function(conn) {
		    //console.log("you outed ", conn);
			//conn.setLabel("");
			othis.displayAllLabelsOnConnection(conn, false);
		});
	}

	this.displayAllLabelsOnConnection = function(connection, display) {
		if(!connection.getOverlays) {
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

	this.gotoVertex = function(name) {
		this.currentVertexName = name;
		this.draw();
	}
	
	this.addLinkedTable = function(divParent, divOffset, vertexName) {
		var missingFrom = [];
		var missingTo = [];
		var links = this.graph.getLinksByName(vertexName);
		var reverseLinks = this.graph.getReverseLinksByName(vertexName);
		
		for(var i=0; i!=links.length; i++) {
			var l = links[i];
			if(gid(this.divPrefix+this.graph.getVertexName(l.target)) == null) {
				missingTo.push(this.graph.getVertexName(l.target));
			}
		}
		for(var i=0; i!=reverseLinks.length; i++) {
			var l = reverseLinks[i];
			if(gid(this.divPrefix+this.graph.getVertexName(l.target)) == null) {
				missingFrom.push(this.graph.getVertexName(l.target));
			}
		}
		
		missingTo.sort();
		missingFrom.sort();
		
		var select = document.createElement("SELECT");
		select.size = missingTo.length+missingFrom.length;
		var prev = null;
		for(var i=0; i!=missingTo.length; i++) {
			if(prev != null && prev==missingTo[i]) {
				continue;
			}
			var o = document.createElement("OPTION");
			o.text = "->" + missingTo[i];
			o.value = missingTo[i];
			select.appendChild(o);
		}
		for(var i=0; i!=missingFrom.length; i++) {
			if(prev != null && prev==missingFrom[i]) {
				continue;
			}
			var o = document.createElement("OPTION");
			o.text = "->" + missingFrom[i];
			o.value = missingFrom[i];
			select.appendChild(o);
		}
		
		var xy = getAbsoluteXY(divOffset);
		var xyParent = getAbsoluteXY(divParent);
		
		var newdiv = document.createElement("DIV");
		newdiv.id = "popup";
		newdiv.style.position = "absolute";
		newdiv.style.top = (xy.y-xyParent.y+20)+"px";
		newdiv.style.left = (xy.x-xyParent.x)+"px";
		
		if(missingFrom.length==0 && missingTo.length==0) {
			newdiv.textContent = "no missing link";
		}
		else {
			select.onclick = select.onchange = function(event) { othis.addLinkedTableOne(select, (xy.x-xyParent.x+50), (xy.y-xyParent.y+50)); };
			newdiv.appendChild(select);
		}
		newdiv.appendChild(document.createElement("BR"));
		var button = document.createElement("INPUT");
		button.type = "button";
		button.value = "close";
		button.style.width = "100%";
		button.onclick = function(event) { othis.closePopup(); };
		newdiv.appendChild(button);
		divParent.appendChild(newdiv);
		
	}
	
	this.addLinkedTableOne = function(select, x, y) {
		this.closePopup();
		var vertexName = select.options[select.selectedIndex].value;
		this.showTable(vertexName, x, y);
		this.linksPaths.highlightCurrentPaths();
	}
	
	this.showTable = function(vertexName, x, y) {
		if(gid(this.divPrefix+vertexName)) {
			return;
		}
		this.appendTable(x, y, vertexName);
		this.appendLinks(this.graph.getVertex(this.graph.getIndex(vertexName)));
		this.jsplumb.draggable(document.querySelectorAll(".linksTable"));
	}
	
	this.closePopup = function() {
		var popup = gid("popup");
		if(popup) {
			popup.parentNode.removeChild(popup);
		}
	}

	this.getTableUrl = function(vertexName) {
		var splt = vertexName.split(".");
		return "table?datasource="+this.currentDatasourceName+"&owner="+splt[0]+"&name="+splt[1];
	}
	
	this.getDetailsUrl = function(vertexName) {
		var splt = vertexName.split(".");
		return "details?datasource="+this.currentDatasourceName+"&type=table&owner="+splt[0]+"&name="+splt[1];
	}
	
	this.hideTable = function(vertexName) {
		var mydiv = gid(this.divPrefix+vertexName);
		var parent = mydiv.parentElement;
		
		this.jsplumb.remove(this.divPrefix+vertexName);
		
	} 
	
	this.showMessage = function(message) {
		this.divMessage.textContent = message;
	}
	
	this.setPathsDiv = function(divPaths, linksConfiguration) {
		this.divPaths = divPaths;
		this.linksPaths = new MitsiLinksPaths(this.divPaths, this, linksConfiguration);
	}
	
	this.setPathFrom = function(vertexName) {
		if(!this.linksPaths) {
			return;
		}
		
		var i = this.graph.getIndex(vertexName);
		this.linksPaths.setStart(i);
	}
	
	this.setPathTo = function(vertexName) {
		if(!this.linksPaths) {
			return;
		}
		
		var i = this.graph.getIndex(vertexName);
		this.linksPaths.setStartOrFinish(i);
	}
}

function dragstart(event) {
	event.dataTransfer.setData("text", event.target.id);
	event.dataTransfer.setData("startX", event.clientX);
	event.dataTransfer.setData("startY", event.clientY);
}

function allowDrop(event) {
	event.preventDefault();
}

function dragend(event) {
	event.preventDefault();
	
	var c = document.getElementById(event.dataTransfer.getData("text"));
	var startX = event.dataTransfer.getData("startX");
	var startY = event.dataTransfer.getData("startY");

	console.log(event.clientX+"-"+startX);
	console.log(event.clientX-startX+"px");
	c.style.left = (c.offsetLeft+ev.clientX-startX)+"px";
	c.style.top = (c.offsetTop+ev.clientY-startY)+"px";
}

////widget to select start, finish and display paths

function MitsiLinksPaths(div, linksGraph, linksConfiguration) {
	//this.messageNoStartSelected = "[no start selected]";
	//this.messageNoFinishSelected = "[no finish selected]";
	this.div = div;
	this.linksGraph = linksGraph;
	this.linksConfiguration = linksConfiguration;
	this.start = null;
	this.finish = null;
	this.paths = [];
	
	this.divInfoMessage = null
	this.selectDirection = null;
	
	var t = document.createElement("TABLE");
	var td = [];
	td[0] = celt("TD");
	td[1] = celt("TD");
	td[2] = celt("TD");
	td[3] = celt("TD");
	td[4] = celt("TD");
	td[5] = celt("TD");
	t.appendChild(celt("TR", { childs : td } ));
	this.div.appendChild(t);
	
	this.startSuggestBox = new SuggestionBox(td[0], "tableNames", "select start here...");
	this.finishSuggestBox = new SuggestionBox(td[2], "tableNames", "select finish here...");
	var aOK = celt("A", {
		att: {
			href : ""
		},
		childs : [
		    celt("IMG", {
		    	att : {
		    		src : "img/ok.png"
		    	}
		    })
		]
	});
	aOK.onclick = function(event) {
		try {
			othis.redrawFromInputBoxes();
		}
		catch(e) {
			console.log(e);
		}
			
		return false;
	}
	var aCancel = celt("A", {
		att: {
			href : ""
		},
		childs : [
		    celt("IMG", {
		    	att : {
		    		src : "img/cancel.png"
		    	}
		    })
		]
	});
	aCancel.onclick = function(event) {
		try {
			othis.paths = [];
			othis.draw();
		}
		catch(e) {
			console.log(e);
		}
		return false;
	}
	var aInverse = celt("A", {
		att: {
			href : ""
		},
		childs : [
		    celt("IMG", {
		    	att : {
		    		src : "img/inverse.png"
		    	}
		    })
		]
	});
	aInverse.onclick = function(event) {
		try {
			othis.paths = [];
			var tmp = othis.startSuggestBox.getValue();
			othis.startSuggestBox.setValue(othis.finishSuggestBox.getValue());
			othis.finishSuggestBox.setValue(tmp);
			othis.redrawFromInputBoxes();
		}
		catch(e) {
			console.log(e);
		}
		return false;
	}
	td[3].appendChild(aOK);
	td[4].appendChild(aCancel);
	td[5].appendChild(aInverse);
	
	this.startSuggestBox.onchange = function(event) {
		othis.redrawFromInputBoxes();
	};
	this.finishSuggestBox.onchange = function(event) {
		othis.redrawFromInputBoxes();
	};

	//td1.textContent = this.messageNoStartSelected;
	//td3.textContent = this.messageNoFinishSelected;

	var s = document.createElement("SELECT");
	var o1 = document.createElement("OPTION");
	o1.text = "<->";
	o1.value = "<->";
	var o2 = document.createElement("OPTION");
	o2.text = "->";
	o2.value = "->";
	var o3 = document.createElement("OPTION");
	o3.text = "<-";
	o3.value = "<-";
	s.appendChild(o1);
	s.appendChild(o2);
	s.appendChild(o3);
	td[1].appendChild(s);
	
	//this.divSuggestionBox = document.createElement("DIV");
	//this.div.appendChild(this.divSuggestionBox);
	
	this.divInfoMessage = document.createElement("DIV");
	this.div.appendChild(this.divInfoMessage);

	//this.divStart = td1;
	//this.divFinish = td3;
	this.selectDirection = s;
	var othis = this;

	this.redrawFromInputBoxes = function() {
		var startStr = othis.startSuggestBox.getValue();
		var finishStr = othis.finishSuggestBox.getValue();
		if(startStr==null || finishStr==null || startStr=="" || finishStr=="") {
			return ;
		}	
		
		othis.start = othis.linksGraph.graph.getIndex(startStr);
		othis.finish = othis.linksGraph.graph.getIndex(finishStr);
		if(!othis.start || !othis.finish) {
			return ;
		}
		
		othis.redraw();
	}

	this.redraw = function() {
		othis.paths = [];
		othis.draw();
		othis.computePaths();
		othis.draw();
	}
	
	this.selectDirection.onchange = function(event) {
		othis.redraw();
	}
	
	this.linksConfiguration.setOnChange(function() {
		othis.redraw();
	});
	
	this.update = function() {
		var tableNames = [];
		for(var i=0; i!=this.linksGraph.graph.vertexes.length; i++) {
			var v = this.linksGraph.graph.vertexes[i];
			tableNames.push(v.name);
		}
		this.startSuggestBox.setEntries(tableNames);
	}

	this.reset = function() {
		this.start = null;
		this.finish = null;	
		this.draw();
	}
	
	this.setStart = function(vertexIndex) {
		this.start = vertexIndex;
		this.redraw();
	}
	
	this.setFinish = function(vertexIndex) {
		this.finish = vertexIndex;
		this.redraw();
	}
	
	this.setStartOrFinish = function(vertexIndex) {
		if(this.start == null) {
			this.start = vertexIndex;
		}
		else {
			this.finish = vertexIndex;
		}
		this.redraw();
	}
	
	this.computePathsSub = function(graph, start, finish) {
		var method = shortesPathMethod.allWithDFS;
		if(this.linksConfiguration) {
			method = this.linksConfiguration.getMethod();
		}
		
		switch(method) {
		case shortesPathMethod.shortestWithDijkstra :
			var dijkstraTable = graph.computeDijkstra(start, false);
			var p = graph.getShortestPath(dijkstraTable, start, finish);
			return p==null ? [] : [p];
			
		case shortesPathMethod.allShortestWithEppstein :
			var tEppstein = graph.computeEppstein(start, finish, false);
			return graph.getAllEqualsShortestPath(tEppstein, start, finish);
			
		case shortesPathMethod.kShortestWithEppstein :
			var tEppstein = graph.computeEppstein(start, finish, false);
			return graph.getKShortestPath(tEppstein, start, finish, this.linksConfiguration.getK());
			
		case shortesPathMethod.kShortestWithDFS :
			//TODO not implemented yet;
			alert("not implemented yet");
			return [];
			
		case shortesPathMethod.allWithDFS :
		default:
			return graph.getAllPaths(start, finish, false);
		}
	}
	
	this.computePaths = function() {
		if(this.start==null || this.finish==null) {
			this.paths = [];
			return;
		}
		
		if(this.selectDirection.selectedIndex==1) {
			this.paths = this.computePathsSub(this.linksGraph.graph, this.start, this.finish);
		}
		else if(this.selectDirection.selectedIndex==2) {
			this.paths = this.computePathsSub(this.linksGraph.graph, this.finish, this.start);
		}
		else {
			this.paths = this.computePathsSub(this.linksGraph.graph, this.start, this.finish);
			var paths2 = this.computePathsSub(this.linksGraph.graph, this.finish, this.start);
			for(var i=0; i!=paths2.length; i++) {
				this.paths.push(paths2[i]);
			}
		}
	}
	
	this.draw = function() {
		//this.divStart.textContent = this.start==null ? this.messageNoStartSelected : this.linksGraph.graph.getVertexName(this.start);
		//this.divFinish.textContent = this.finish==null ? this.messageNoFinishSelected : this.linksGraph.graph.getVertexName(this.finish);
		this.startSuggestBox.setValue(this.start==null ? "" : this.linksGraph.graph.getVertexName(this.start))
		this.finishSuggestBox.setValue(this.finish==null ? "" : this.linksGraph.graph.getVertexName(this.finish))
		this.highlightCurrentPaths();
	}

	
	this.highlightCurrentPaths = function () {
		this.unhighlightPaths();
		this.divInfoMessage.innerHTML = "";
		var currentPaths = this.paths;
		if(currentPaths.length > 0) {
			this.divInfoMessage.appendChild(document.createTextNode("current paths highlighted : "));
		}
		else {
			this.divInfoMessage.appendChild(document.createTextNode("no path highlighted"));
			return;
		}
		this.divInfoMessage.appendChild(document.createElement("BR"));

		var t = document.createElement("TABLE");
		t.cellSpacing = "0";
		this.divInfoMessage.appendChild(t);
		for(var i=0; i!=currentPaths.length; i++) {
			var path = currentPaths[i];
			//var str = "";
			var prev = null;
			for(var j=0; j!=path.length; j++) {
				
				this.highlightTable(this.linksGraph.graph.getVertexName(path[j]));
				//if(j != 0) {
				//	str = str + " -> ";
				//}
				//str = str + graph.getVertexName(path[j]);
				if(prev != null) {
					this.highlightLink(this.linksGraph.graph.getVertexName(prev), this.linksGraph.graph.getVertexName(path[j]))
				}
				prev = path[j];
			}
			//infoMessage.appendChild(document.createTextNode(str));*/
			
			var tr = document.createElement("TR");
			var td = document.createElement("TD");
			//var d = document.createElement("DIV");
			//d.style.verticalAlign = "top";
			var aRemovePath = document.createElement("A");
			aRemovePath.title = "remove this path";
			aRemovePath.href = "";
			aRemovePath.style.verticalAlign = "top";
			aRemovePath.onclick = function(event) {
				var iPathToRemove = this.parentNode.parentNode.rowIndex;
				othis.paths.splice(iPathToRemove, 1);
				othis.draw();
				return false;
			}
			var imgRemovePath = document.createElement("IMG");
			imgRemovePath.src = "img/greycross.png";
			aRemovePath.appendChild(imgRemovePath);
			td.appendChild(aRemovePath);
			td.appendChild(this.buildPathArrow(path, 20));
			//td.appendChild(d);
			tr.appendChild(td);
			t.appendChild(tr);
			//infoMessage.appendChild(document.createElement("BR"));
		}
		
		/*var aClearAll = document.createElement("A");
		aClearAll.href = "";
		aClearAll.appendChild(document.createTextNode("clear all paths"));
		aClearAll.onclick = function(event) {
			try {
				othis.paths = [];
				othis.draw();
			}
			catch (e) {
				console.log(e);
			}
			return false;
		}
		this.divInfoMessage.appendChild(aClearAll);
		*/
	}

	this.highlightTable = function (vertexName) {
		var div = gid(this.linksGraph.divPrefix+vertexName);
		if(div) {
			div.className = "linksTableHighlight";
		}
	}

	this.unhighlightLinksForDivId = function (id) {
		var connectionList = this.linksGraph.jsplumb.getConnections({ source:id });
		if(!connectionList) {
			return;
		}
		
		for(key in connectionList) {
			var connection = connectionList[key];
			connection.setPaintStyle ({ 
		    	strokeStyle:"lightgrey", 
		    	lineWidth:2
		    })
		}
	}

	this.highlightLink = function (v1, v2) {
		var connectionList = this.linksGraph.jsplumb.getConnections({ source:this.linksGraph.divPrefix+v1, target:this.linksGraph.divPrefix+v2 });
		if(!connectionList) {
			return;
		}
		
		for(key in connectionList) {
			var connection = connectionList[key];
			connection.setPaintStyle ({ 
		    	strokeStyle:"orange", 
		    	lineWidth:3
		    })
		}
	}

	this.unhighlightPaths = function () {
		var elts = document.getElementsByClassName("linksTableHighlight");
		var nb = elts.length;
		
		for(var i=0; i!=nb; i++) {
			this.unhighlightLinksForDivId(elts[0].id);
			elts[0].className = "linksTable";
		}
		
	}


	this.buildPathArrowTdText = function (t, height) {
		var d = document.createElement("DIV");
		d.style.height = height+"px";
	    d.style.backgroundColor = "lightgreen";
		d.appendChild(t);
		
		var td = document.createElement("TD");
		td.appendChild(d);
		td.style.padding = "0";
		td.style.margin = "0";
		return td;
	}

	this.buildPathArrowTdSvg = function (display1, display2, height) {
		var space = 7;

		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");;
		svg.setAttribute("width", (height/2+space)+"px");
		svg.setAttribute("height", height+"px");
		
		if(display1) {
			var p1 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			p1.style.fill = "lightgreen";
			p1.setAttribute("points", "0,0 "+(height/2)+","+(height/2)+" 0,"+height);
			svg.appendChild(p1);
		}

		if(display2) {
			var p2 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			p2.style.fill = "lightgreen";
			p2.setAttribute("points", space+",0 "+(height/2+space)+","+(height/2)+" "+space+","+height+" "+(height/2+space)+","+height+" "+(height/2+space)+",0");
			svg.appendChild(p2);
		}
		
		var td = document.createElement("TD");
		td.style.padding = "0";
		td.style.margin = "0";
		td.appendChild(svg);
		return td;
	}

	this.buildPathArrowLabel = function(vertexName) {
		var d = document.createElement("DIV");
		var a = document.createElement("A");
		a.href = "";
		a.onclick = function(event) {
			try {
				//alert("plus "+vertexName);
				othis.linksGraph.showTable(vertexName, 100, 100);
				othis.draw();
			} catch (e) { console.log(e); }
			return false;
		}
		var img = document.createElement("IMG");
		img.src = "img/plus.png";
		img.style.height = "16px";
		img.style.verticalAlign = "middle";
		a.appendChild(img);
		d.appendChild(a);
		
		var a2=document.createElement("A");
		a2.href = "";
		a2.onclick = function(event) {
			try {
				othis.linksGraph.gotoVertex(vertexName);
				othis.draw();
			} catch (e) { console.log(e); }
			return false;
		}
		a2.appendChild(document.createTextNode(vertexName));
		d.appendChild(a2);
		return d;
	}

	this.buildPathArrow = function (path, height) {

		var t = document.createElement("TABLE");
		t.cellSpacing = "0";
		//t.style.margin = "2px";
		t.style.display = "inline-table";
		t.style.display = "inline-table";
		var tr = document.createElement("TR");
		tr.style.verticalAlign = "top";
		t.appendChild(tr);
		
		
		for(var i=0; i!=path.length; i++) {
			var vertexName = this.linksGraph.graph.getVertexName(path[i]);
			var d = this.buildPathArrowLabel(vertexName);
			//var d = document.createTextNode(vertexName);
			
			tr.appendChild(this.buildPathArrowTdSvg(i!=0, true, height));
			tr.appendChild(this.buildPathArrowTdText(d, height ));
		}	
		tr.appendChild(this.buildPathArrowTdSvg(true, false, height));
		

		return t;
	}
	
}


