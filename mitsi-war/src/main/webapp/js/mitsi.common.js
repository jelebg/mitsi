// recupérer un élément par id
function gid(id) {
	return document.getElementById(id);
}

// creer un élément rapido
function celt(nodeName, properties) {
	var n = document.createElement(nodeName);
	if(!properties) {
		return n;
	}
	var attributes = properties.att;
	var styles = properties.styles;
	var childs = properties.childs;
	
	if(attributes) {
		for(var a in attributes) {
			n.setAttribute(a, attributes[a]);
		}
	}
	
	if(styles) {
		for(var s in styles) {
			n.style[s] = styles[s];
		}
	}
	
	if(childs) {
		for(var i=0; i!=childs.length; i++) {
			n.appendChild(childs[i]);
		}
	}
	
	return n;
}

// creer un node texte rapido
function ctn(text) {
	return document.createTextNode(text);
}

// appeller une GsonServlet
function callGsonServlet(gsonServlet, request, onresponse, onerror) {
	var json = JSON.stringify(request);

	// exceptionnellement on travaille en synchrone
	var xhr = new XMLHttpRequest();
	xhr.open("POST", gsonServlet, true);
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status != 200) {
				console.log("onreadystatechange error status="+xhr.status+" statusText="+xhr.statusText)
				if(onerror) {
					onerror(xhr.status, xhr.statusText);
				}
				
			} else {
				console.log(xhr.responseText);
				if(onresponse) {
					var response = JSON.parse(xhr.responseText);
					onresponse(response);
				}
			}
		}
	}
	
	if(onerror) {
		xhr.onerror = function(err) {
			console.log("onerror err="+err);
			onerror(e.target.status, "");
		}
	}

	xhr.send(json);
}

// common functions to use div
function appendTextToDivTokenized(div, text) {
	lines = text.split("\n");
	for(var i=0; i!=lines.length; i++) {
		var line = lines[i];
		if(i>0) {
			div.appendChild(document.createElement("BR"));
		}
		
		div.appendChild(document.createTextNode(line));
	}
}