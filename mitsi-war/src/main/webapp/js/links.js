var jsplumb = null;
var divPrefix = "mitsiObject_";
var relations = null;
var graph = null;
var dijkstraTable = null;
var dijkstraReverseTable = null;
var currentVertexName = null;

var currentPaths = [];

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
	prepareDisjkstra();
}

function gotoVertex(name) {
	currentVertexName = name;
	draw();
	prepareDisjkstra();
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
	
	jsplumb.draggable(document.querySelectorAll(".linksTable"));
	highlightCurrentPaths();
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
	appendTableIcon(td21, name, "img/plus.png", "add linked table", function(event, vertexName) { addLinkedTable(div, td21, vertexName); } , "" );
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

function addLinkedTable(divParent, divOffset, vertexName) {
	var missingFrom = [];
	var missingTo = [];
	var links = graph.getLinksByName(vertexName);
	var reverseLinks = graph.getReverseLinksByName(vertexName);
	
	for(var i=0; i!=links.length; i++) {
		var l = links[i];
		if(gid(divPrefix+graph.getVertexName(l.target)) == null) {
			missingTo.push(graph.getVertexName(l.target));
		}
	}
	for(var i=0; i!=reverseLinks.length; i++) {
		var l = reverseLinks[i];
		if(gid(divPrefix+graph.getVertexName(l.target)) == null) {
			missingFrom.push(graph.getVertexName(l.target));
		}
	}
	
	missingTo.sort();
	missingFrom.sort();
	
	var select = document.createElement("SELECT");
	select.size = missingTo.length+missingFrom.length;
	//var str = "";
	var prev = null;
	for(var i=0; i!=missingTo.length; i++) {
		//str = str + "->" + graph.getVertexName(missingTo[i]) + "\n";
		if(prev != null && prev==missingTo[i]) {
			continue;
		}
		var o = document.createElement("OPTION");
		o.text = "->" + missingTo[i];
		o.value = missingTo[i];
		select.appendChild(o);
	}
	for(var i=0; i!=missingFrom.length; i++) {
		//str = str + "<-" + graph.getVertexName(missingFrom[i]) + "\n";
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
	
	//alert("missing:\n"+str);
	var newdiv = document.createElement("DIV");
	newdiv.id = "popup";
	newdiv.style.position = "absolute";
	newdiv.style.top = (xy.y-xyParent.y+20)+"px";
	newdiv.style.left = (xy.x-xyParent.x)+"px";
	//newdiv.textContent = str;
	
	if(missingFrom.length==0 && missingTo.length==0) {
		newdiv.textContent = "no missing link";
	}
	else {
		select.onclick = select.onchange = function(event) { addLinkedTableOne(select, (xy.x-xyParent.x+50), (xy.y-xyParent.y+50)); };
		newdiv.appendChild(select);
	}
	newdiv.appendChild(document.createElement("BR"));
	var button = document.createElement("INPUT");
	button.type = "button";
	button.value = "close";
	button.style.width = "100%";
	button.onclick = function(event) { closePopup(); };
	newdiv.appendChild(button);
	divParent.appendChild(newdiv);
	
	
	//alert(str);
}

function addLinkedTableOne(select, x, y) {
	closePopup();
	var vertexName = select.options[select.selectedIndex].value;
	if(gid(divPrefix+vertexName)) {
		return;
	}
	appendTable(gid("linksContent"), x, y, vertexName);
	appendLinks(graph.getVertex(graph.getIndex(vertexName)));
	jsplumb.draggable(document.querySelectorAll(".linksTable"));
	highlightCurrentPaths();

}

function closePopup() {
	var popup = gid("popup");
	if(popup) {
		popup.offsetParent.removeChild(popup);
	}
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
		else {
			fk(targetVertexName, vertex.name, l.properties.keyColumns, l.properties.rKeyColumns);
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
	dijkstraTable = graph.computeDijkstra(startIndex, false);
	dijkstraReverseTable = graph.computeDijkstra(startIndex, true);
	
	var select = gid("shortestPathToSelect");
	select.innerHTML = "";
	//select.appendChild(document.createElement("OPTION"));
	var mysort = [];
	
	for(var i=0; i!=dijkstraTable.length; i++) {
		
		if(dijkstraTable[i] && dijkstraTable[i].p!=-1) {
			mysort["-> " + graph.getVertexName(i)] = i;
		}
	}
	
	for(var i=0; i!=dijkstraReverseTable.length; i++) {
		
		if(dijkstraReverseTable[i] && dijkstraReverseTable[i].p!=-1) {
			mysort["<- " + graph.getVertexName(i)] = i;
		}
	}
	
	mysort.sort();
	
	for(k in mysort) {
		var o = document.createElement("OPTION");
		o.value = mysort[k];
		o.text = k;
		select.appendChild(o);
	}
}

function highlightShortestPath() {
	
	var select = gid("shortestPathToSelect");
	var endIndex = select.options[select.selectedIndex].value;
	var text = select.options[select.selectedIndex].text;
	var reverse = false;
	if(text && text.substr(0, 1)=="<") {
		reverse = true;
	}
	
	var path = graph.getPath(reverse ? dijkstraReverseTable : dijkstraTable, endIndex);
	if(reverse) {
		currentPaths = [ path.reverse() ];
	}
	else {
		currentPaths = [ path ];
	}
	highlightCurrentPaths();
}

function highlightAllShortestPaths() {
	var select = gid("shortestPathToSelect");
	var endIndex = select.options[select.selectedIndex].value;
	var startIndex = graph.getIndex(currentVertexName);
	var text = select.options[select.selectedIndex].text;
	if(text && text.substr(0, 1)=="<") {
		var tmp = endIndex;
		endIndex = startIndex;
		startIndex = tmp;
	}

	var tEppstein = graph.computeEppstein(startIndex, endIndex, false);
	currentPaths = graph.getAllEqualsShortestPath(tEppstein, startIndex, endIndex);
	
	highlightCurrentPaths();

}

function highlightKShortestPaths() {
	var select = gid("shortestPathToSelect");
	var endIndex = select.options[select.selectedIndex].value;
	var startIndex = graph.getIndex(currentVertexName);
	var k = gid("kShortest").value;
	var text = select.options[select.selectedIndex].text;
	if(text && text.substr(0, 1)=="<") {
		var tmp = endIndex;
		endIndex = startIndex;
		startIndex = tmp;
	}
	
	var tEppstein = graph.computeEppstein(startIndex, endIndex, false);
	currentPaths  = graph.getKShortestPath(tEppstein, startIndex, endIndex, parseInt(k));
	
	highlightCurrentPaths();

}

function highlightAllPaths() {
	var select = gid("shortestPathToSelect");
	var endIndex = select.options[select.selectedIndex].value;
	var startIndex = graph.getIndex(currentVertexName);
	var text = select.options[select.selectedIndex].text;
	var reverse = false;
	if(text && text.substr(0, 1)=="<") {
		reverse = true;
	}

	currentPaths = graph.getAllPaths(startIndex, endIndex, reverse);
	if(reverse) {
		for(var i=0; i!=currentPaths.length; i++) {
			currentPaths[i] = [ currentPaths[i].reverse() ];
		}
	}
	
	highlightCurrentPaths();
	
}

function highlightCurrentPaths() {
	unhighlightPaths();
	var infoMessage = gid("infoMessage");
	infoMessage.innerHTML = "";
	if(currentPaths.length > 0) {
		infoMessage.appendChild(document.createTextNode("current paths highlighted : "));
	}
	else {
		infoMessage.appendChild(document.createTextNode("no path highlighted"));
	}
	infoMessage.appendChild(document.createElement("BR"));

	for(var i=0; i!=currentPaths.length; i++) {
		var path = currentPaths[i];
		//var str = "";
		var prev = null;
		for(var j=0; j!=path.length; j++) {
			
			highlightTable(graph.getVertexName(path[j]));
			//if(j != 0) {
			//	str = str + " -> ";
			//}
			//str = str + graph.getVertexName(path[j]);
			if(prev != null) {
				highlightLink(graph.getVertexName(prev), graph.getVertexName(path[j]))
			}
			prev = path[j];
		}
		//infoMessage.appendChild(document.createTextNode(str));*/
		
		infoMessage.appendChild(buildPathArrow(path, 20));
		//infoMessage.appendChild(document.createElement("BR"));
	}
	
}

function highlightTable(vertexName) {
	var div = gid(divPrefix+vertexName);
	if(div) {
		div.className = "linksTableHighlight";
	}
}

function unhighlightLinksForDivId(id) {
	var connectionList = jsplumb.getConnections({ source:id });
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

function highlightLink(v1, v2) {
	var connectionList = jsplumb.getConnections({ source:divPrefix+v1, target:divPrefix+v2 });
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

function clearPaths() {
	gid("infoMessage").innerHTML = "no path highlighted";
	currentPaths = [];
	unhighlightPaths();
}

function unhighlightPaths() {
	//currentPaths = [];
	var elts = document.getElementsByClassName("linksTableHighlight");
	var nb = elts.length;
	
	for(var i=0; i!=nb; i++) {
		unhighlightLinksForDivId(elts[0].id);
		elts[0].className = "linksTable";
	}
	
}


function buildPathArrowTdText(t, height) {
	var d = document.createElement("DIV");
	d.style.height = height+"px";
    d.style.backgroundColor = "lightgreen";
	d.appendChild(t);
	
	var td = document.createElement("TD");
	td.appendChild(d);
	td.style.padding = "0";
	return td;
}

function buildPathArrowTdSvg(display1, display2, height) {
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
	td.appendChild(svg);
	return td;
}


function buildPathArrow(path, height) {

	var t = document.createElement("TABLE");
	t.cellSpacing = "0";
	t.style.margin = "2px";
	var tr = document.createElement("TR");
	tr.style.verticalAlign = "top";
	t.appendChild(tr);
	
	
	for(var i=0; i!=path.length; i++) {
		var vertexName = graph.getVertexName(path[i]);
		var d = document.createTextNode(vertexName);
		
		tr.appendChild(buildPathArrowTdSvg(i!=0, true, height));
		tr.appendChild(buildPathArrowTdText(d, height ));
	}	
	tr.appendChild(buildPathArrowTdSvg(true, false, height));
	

	return t;
}