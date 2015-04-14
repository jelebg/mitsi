var jsplumb = null;
var divPrefix = "mitsiObject_";
var relations = null;
var graph = null;
var dijkstraTable = null;
var currentVertexName = null
//var reverseGraph = null;

/*var json = {
	tableName : "LA_TABLE_CENTRALE",
	before : [
	          {tableName : "TABLE11", columnsFrom:["champFrom111", "champFrom112"], columnsTo:["champTo111", "champTo112"]},
	          {tableName : "TABLE12", columnsFrom:["champFrom121", "champFrom122"], columnsTo:["champTo121", "champTo122"]}
		],
	after : [
	          {tableName : "TABLE21", columnsFrom:["champFrom211", "champFrom212"], columnsTo:["champTo211", "champTo212"]},
	          {tableName : "TABLE22", columnsFrom:["champFrom221", "champFrom222"], columnsTo:["champTo211", "champTo222"]}
		]
}*/

function getAllRelations() {
	callGsonServlet("GetAllRelationsServlet", 
			{
				"datasourceName" : datasourceName
			},
			function(response) { 
				console.log(response);
				showMessage(response.message);
				relations = response.relations;
				if(relations) {
					graph = new MitsiGraph(relations);
					//reverseGraph = new MitsiGraph(relations, true);
					gotoNodeByObjectName(owner, objectName);
				}
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);
	
}

function showMessage(message) {
	var div = gid("linksHeader");
	div.innerHTML = "";
	div.appendChild(document.createTextNode(datasourceName + " - Relations between tables, begining from "+owner+"."+objectName));
	div.appendChild(document.createElement("BR"));
	if(message) {
		div.appendChild(document.createTextNode(message));
	}
}

function gotoNodeByObjectName(objectOwner, objectName) {
	currentVertexName = objectOwner+"."+objectName;
	draw();
}

function gotoVertex(name) {
	currentVertexName = name;
	draw();
}

function draw() {
	var depthSelect = gid("depthSelect");
	var depth = parseInt(depthSelect.options[depthSelect.selectedIndex].value);
	
	var content = gid("linksContent");
	content.innerHTML = "";
	//if(jsplumb) {
	//	jsplumb.reset();
	//}
	jsPlumb.setContainer(content);
	jsplumb = jsPlumb.getInstance();
	jsplumb.empty("linksContent");
	jsPlumb.importDefaults({
		  Endpoints : [ [ "Dot", { radius:5 } ], [ "Dot", { radius:5 } ] ]
	});
	
	content.ondrop = function(event) { dragend(event); };
	content.ondragover = function(event) { allowDrop(event); };
	
	var name = currentVertexName;
	var currentVertexIndex = graph.getIndex(currentVertexName);
	
	var proximityGraph = graph.getProximityGraph(currentVertexIndex, depth);
	

	
	/*var x0 = 20;
	var y0 = 20;
	var dx = 300;
	var dy = 100;
	*/
	
	
	var radiu = [];
	
	// compute radius considering the max number of linked tables for each level, before or after 
	var maxmax = 0;
	for(var i=0; i!=depth; i++) {
		var r = 200*(i+1);
		var max = Math.max(proximityGraph.before[i].length , proximityGraph.after[i].length);
		if(max > maxmax) {
			maxmax = max;
		}
		if(maxmax > 4) {
			r = (i+1) * maxmax * 50;
		}
		radiu[i] = r;
	}
	var x0 = radiu[depth-1];
	var y0 = radiu[depth-1];
	
	// append tables
	appendTable(content, x0+40, y0+20, name);
	for(var i=0; i!=depth; i++) {
		for(var j=0; j!=proximityGraph.before[i].length; j++) {
			var index = proximityGraph.before[i][j];
			var vertexName = graph.getVertexName(index);
			//appendTable(content, x0+dx*(depth-i-1), y0+dy*j, vertexName);
			appendTable(content, 
					x0-radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.before[i].length+3)), 
					y0-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.before[i].length+3)), 
					vertexName);
		}
		for(var j=0; j!=proximityGraph.after[i].length; j++) {
			var index = proximityGraph.after[i][j];
			var vertexName = graph.getVertexName(index);
			//appendTable(content, x0+dx*(i+depth+1), y0+dy*j, vertexName);
			appendTable(content, 
					x0+80+radiu[i]*Math.sin(Math.PI*(j+2)/(proximityGraph.after[i].length+3)), 
					y0+40-radiu[i]*Math.cos(Math.PI*(j+2)/(proximityGraph.after[i].length+3)), 
					vertexName);
		}
	}
	
	// append links between tables
	appendLinks(graph.getVertex(currentVertexIndex));
	for(var i=0; i!=depth; i++) {
		for(var j=0; j!=proximityGraph.before[i].length; j++) {
			var index = proximityGraph.before[i][j];
			var vertex = graph.getVertex(index);
			appendLinks(vertex);
		}
		for(var j=0; j!=proximityGraph.after[i].length; j++) {
			var index = proximityGraph.after[i][j];
			var vertex = graph.getVertex(index);
			appendLinks(vertex);
		}
	}
	
	
	
	/*
	//appendTable(content, 300, 100, json.tableName);
	appendTable(content, 300, 100, name);
	
	//var before = reverseGraph.getLinks(currentVertexName);
	var before = graph.getReverseLinks(currentVertexName);
	var after = graph.getLinks(currentVertexName);
	
	for(var i=0; i!=before.length; i++) {
		var l = before[i];
		appendTable(content, 10, 10+150*i, l.targetName);
		fk(l.targetName, name, l.properties.keyColumns, l.properties.rKeyColumns);
	}
	
	for(var i=0; i!=after.length; i++) {
		var l = after[i];
		appendTable(content, 700, 10+150*i, l.targetName);
		fk(name, l.targetName, l.properties.keyColumns, l.properties.rKeyColumns);
	}
	*/
	
	jsplumb.draggable(document.querySelectorAll(".linksTable")/*, { grid: [20, 20] }*/);
}

function bodyOnLoad() {
	
	showMessage("");
	
	getAllRelations();
	


}

function appendTableIcon(div, vertexName, imgsrc, title, fonclick, url ) {
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
	div.appendChild(a);
}
function appendTable(div, left, top, name) {
	var d = document.createElement("DIV");
	d.id = divPrefix+name;
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
	appendTableIcon(td21, name, "img/proxgraph.png", "show links from this table", function(event, vertexName) { gotoVertex(vertexName); } , "" );
	appendTableIcon(td21, name, "img/plus.png", "add linked table", function(event, vertexName) { addLinkedTable(vertexName); } , "" );
	appendTableIcon(td21, name, "img/table.png", "show table content", null, getTableUrl(name) );
	appendTableIcon(td21, name, "img/details.png", "show table details", null, getDetailsUrl(name) );
	appendTableIcon(td21, name, "img/greycross.png", "hide table", function(event, vertexName) { hideTable(vertexName); } , "" );
	

	a.onclick = function(event) {
		try {
			gotoVertex(name);
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
	
	div.appendChild(d);
}

function getTableUrl(vertexName) {
	var splt = vertexName.split(".");
	return "table?datasource="+datasourceName+"&owner="+splt[0]+"&name="+splt[1];
}

function getDetailsUrl(vertexName) {
	var splt = vertexName.split(".");
	return "details?datasource="+datasourceName+"&type=table&owner="+splt[0]+"&name="+splt[1];
}

function hideTable(vertexName) {
	var div = gid(divPrefix+vertexName);
	var parent = div.parentElement;
	
	jsplumb.remove(divPrefix+vertexName);
	//parend.removeChild(div);
}

function addLinkedTable(vertexName) {
	var missingFrom = [];
	var missingTo = [];
	var links = graph.getLinksByName(vertexName);
	var reverseLinks = graph.getReverseLinksByName(vertexName);
	
	//TODO : popup
	
	for(var i=0; i!=links.length; i++) {
		var l = links[i];
		if(gid(divPrefix+graph.getVertexName(l.target)) == null) {
			missingTo.push(l.target);
		}
	}
	for(var i=0; i!=reverseLinks.length; i++) {
		var l = reverseLinks[i];
		if(gid(divPrefix+graph.getVertexName(l.target)) == null) {
			missingFrom.push(l.target);
		}
	}
	
	var str = "";
	for(var i=0; i!=missingTo.length; i++) {
		str = str + "->" + graph.getVertexName(missingTo[i]) + "\n";
	}
	for(var i=0; i!=missingFrom.length; i++) {
		str = str + "<-" + graph.getVertexName(missingFrom[i]) + "\n";
	}
	alert("missing:\n"+str);
}

function appendLinks(vertex) {
	var missingLinks = []; 
	
	for(var i=0; i!=vertex.links.length; i++) {
		var l = vertex.links[i];
		var targetVertexName = graph.getVertexName(l.target);
		
		if(gid(divPrefix+targetVertexName)==null) {
			missingLinks.push(targetVertexName);
		}
		else {
			fk(vertex.name, targetVertexName, l.properties.keyColumns, l.properties.rKeyColumns);
		}
	}

	for(var i=0; i!=vertex.reverseLinks.length; i++) {
		var l = vertex.reverseLinks[i];
		var targetVertexName = graph.getVertexName(l.target);
		
		if(gid(divPrefix+targetVertexName)==null) {
			missingLinks.push(targetVertexName);
		}
	}
	
	if(missingLinks.length>0) {
		gid(divPrefix+vertex.name).title = "not displayed here : links to "+Array.join(missingLinks, ", ");
	}
	else {
		gid(divPrefix+vertex.name).title = "all links displayed for this table";
	}
}

function fk(from, to, columnsFrom, columnsTo) {
	var connection = jsplumb.connect({
		source:divPrefix+from,
		target:divPrefix+to
	    ,paintStyle:{ 
	    	strokeStyle:"lightgrey", 
	    	lineWidth:1
	    }
    	,hoverPaintStyle:{ 
    		strokeStyle:"black", 
    	    lineWidth:3
    	}
    	,endpointStyle:{ 
    		fillStyle:"lightgrey", 
    		outlineWidth:1 
    	}
    	,anchor:[ "Right", "Left" ]
		,overlays:[ "Arrow", 
			[ "Label", { label:columnsFrom, location:0.2, labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}} ] 
			,[ "Label", { label:columnsTo, location:0.8, labelStyle:{fillStyle:"white", borderWidth:"1", borderStyle:"lightgrey"}} ]
		  ]
	});
	displayAllLabelsOnConnection(connection, false);

	connection.bind("mouseover", function(conn) {
	    //console.log("you overed ", conn);
		displayAllLabelsOnConnection(conn, true);
	});
	connection.bind("mouseout", function(conn) {
	    //console.log("you outed ", conn);
		//conn.setLabel("");
		displayAllLabelsOnConnection(conn, false);
	});
}

function displayAllLabelsOnConnection(connection, display) {
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

    //ev.dataTransfer.setData("text", ev.target.id);
	console.log(event.clientX+"-"+startX);
	console.log(event.clientX-startX+"px");
	//c.style.left = ev.clientX+"px";
	c.style.left = (c.offsetLeft+ev.clientX-startX)+"px";
	c.style.top = (c.offsetTop+ev.clientY-startY)+"px";
}

function prepareDisjkstra() {
	var startIndex = graph.getIndex(currentVertexName);
	dijkstraTable = graph.computeDijkstra(startIndex);
	
	var select = gid("shortestPathToSelect");
	select.innerHTML = "";
	select.appendChild(document.createElement("OPTION"));
	for(var i=0; i!=dijkstraTable.length; i++) {
		
		if(dijkstraTable[i] && dijkstraTable[i].p!=-1) {
			var o = document.createElement("OPTION");
			o.value = i;
			o.text = graph.getVertexName(i);
			select.appendChild(o);
		}
		
	}
}

function highlightShortestPath() {
	var select = gid("shortestPathToSelect");
	var endIndex = select.options[select.selectedIndex].value
	
	var path = graph.getPath(dijkstraTable, endIndex);
	var str = "";
	for(var i=0; i!=path.length; i++) {
		str = str + graph.getVertexName(path[i]) + "\n";
	}
	alert(str);
}