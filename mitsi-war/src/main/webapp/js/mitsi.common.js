// recupérer un élément par id
function gid(id) {
	return document.getElementById(id);
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