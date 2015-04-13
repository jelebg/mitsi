var jsplumb = null;
var divPrefix = "mitsiObject_";
var relations = null;
var graph = null;
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

	content.ondrop = function(event) { dragend(event); };
	content.ondragover = function(event) { allowDrop(event); };
	
	var name = currentVertexName;
	var currentVertexIndex = graph.getIndex(currentVertexName);
	var toexplore = [ currentVertexIndex ];
	var explored = [];
	var before = [];
	var after = [];
	
	for(var i=0; i!=depth; i++) {
		var newBefore = [];
		var newAfter = [];
		var toexplorenext = [];

		for(var j=0; j!=toexplore.length; j++) {
			var exploreIndex = toexplore[j];
			explored.push(exploreIndex);
			var links = graph.getLinks(exploreIndex);
			var reverseLinks = graph.getReverseLinks(exploreIndex);
			
			for(var k=0; k!=links.length; k++) {
				var index = links[k].target;

				if(explored.indexOf(index) < 0 && toexplorenext.indexOf(index) < 0 && toexplore.indexOf(index) < 0) {
					newAfter.push(index);
					toexplorenext.push(index);
				}
			}
			
			for(var k=0; k!=reverseLinks.length; k++) {
				var index = reverseLinks[k].target;
				
				if(explored.indexOf(index) < 0 && toexplorenext.indexOf(index) < 0 && toexplore.indexOf(index) < 0) {
					newBefore.push(index);
					toexplorenext.push(index);
				}
			}
		}
		
		before[i] = newBefore;
		after[i] = newAfter;
		toexplore = toexplorenext;
		
	}
	
	var x0 = 20;
	var y0 = 20;
	var dx = 300;
	var dy = 100;
	
	// append tables
	appendTable(content, x0+dx*depth, y0+80, name);
	for(var i=0; i!=depth; i++) {
		for(var j=0; j!=before[i].length; j++) {
			var index = before[i][j];
			var vertexName = graph.getVertexName(index);
			appendTable(content, x0+dx*(depth-i-1), y0+dy*j, vertexName);
		}
		for(var j=0; j!=after[i].length; j++) {
			var index = after[i][j];
			var vertexName = graph.getVertexName(index);
			appendTable(content, x0+dx*(i+depth+1), y0+dy*j, vertexName);
		}
	}
	
	// append links between tables
	appendLinks(graph.getVertex(currentVertexIndex));
	for(var i=0; i!=depth; i++) {
		for(var j=0; j!=before[i].length; j++) {
			var index = before[i][j];
			var vertex = graph.getVertex(index);
			appendLinks(vertex);
		}
		for(var j=0; j!=after[i].length; j++) {
			var index = after[i][j];
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

function appendTableIcon(div, vertexName, imgsrc, title, fonclick ) {
	var img = document.createElement("IMG");
	var a = document.createElement("A");
	img.src = imgsrc
	a.title = title;
	a.href = "";
	a.onclick = function(event) {
		try {
			fonclick(event, vertexName);
		}
		catch (e) {
			console.log(e);
		}
		return false;
		
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
	appendTableIcon(td21, name, "img/proxgraph.png", "show links from this table", function(event, vertexName) { gotoVertex(vertexName); } );
	appendTableIcon(td21, name, "img/table.png", "show table content", function(event, vertexName) { alert("2:"+vertexName); } );
	appendTableIcon(td21, name, "img/details.png", "show table details", function(event, vertexName) { alert("3:"+vertexName); } );
	

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
	jsplumb.connect({
		source:divPrefix+from,
		target:divPrefix+to
		,anchor:[ "Right", "Left" ]
		,overlays:[ "Arrow", 
			[ "Label", { label:columnsFrom, location:0.2, labelStyle:{fillStyle:"lightgrey", borderWidth:"1"}} ], 
			[ "Label", { label:columnsTo, location:0.8} ]
		  ]
	});

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
