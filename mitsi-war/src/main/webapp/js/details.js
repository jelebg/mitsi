var contents = null;


function displayObjectCall(datasourceName, objectName, objectType, owner) {
	// page title
	document.title = datasourceName + " - " + objectName + (objectType=="" ? "" : " ("+objectType+")") + " - MITSI details page";
	
	// header
	var divHeader = gid("detailsHeader");
	divHeader.textContent = datasourceName + " - " + objectName + (objectType=="" ? "" : " ("+objectType+")");

	callGsonServlet("GetDetailsServlet", 
			{
				"datasourceName" : datasourceName,
				"objectName"     : objectName,
				"objectType"     : objectType,
				"owner"          : owner
			},
			function(response) { 
				console.log(response);
				displayObject(datasourceName, objectName, objectType, response);
				
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);
}

// TODO : handsontable pour trier les colonnes 
function displayObject(datasourceName, objectName, objectType, response) {
	
	var divContent = gid("detailsContent");
	divContent.innerHTML = "";
	
	// message
	
	if(response.message) {
		var divMessage = document.createElement("DIV");
		divMessage.textContent = response.message;
		detailsContent.appendChild(divMessage);
	}
	
	
	// content
	
	contents = [];
	if(response.accordions) {
		for(var iAccordion=0; iAccordion!=response.accordions.length; iAccordion++) {
			var accordion = response.accordions[iAccordion];

			
			var div2 = document.createElement("DIV");
			
			div2.style.width = "100%";
			div2.className = "detailsAccordionTitle";
			div2.textContent = accordion.title;
			divContent.appendChild(div2);
			
			var newDiv = document.createElement("DIV");
			divContent.appendChild(newDiv);
			
			var newSmallMenu = new MitsiPanelSmallMenu(div2,
					"20px",
					40,
					15,
					[{ title:"unroll", imgsrc:"img/unroll.png" }
					]);
			
			var newAccordion = new MitsiAccordion(newDiv,
					"contentAccordion",
					newSmallMenu.getDiv(0),
					true,
					false);
			
			if(accordion.message && !accordion.message=="") {
				var divMessage = document.createElement("DIV");
				appendTextToDivTokenized(divMessage, accordion.message);
				newDiv.appendChild(divMessage);
			}
			
			if(accordion.data || accordion.columns) {
				displayTable(newDiv, accordion.data, accordion.columns, accordion.links);

			}
			
			var content = {div:newDiv, accordion:newAccordion, smallMenu:newSmallMenu};
			contents.push(content);
		}
	}
}

// only works if json is inside the last column
function displayTable(div, data, columns, links) {
	var table = document.createElement("TABLE");
	var jsonColumnNames = null;
	
	var trHeader = null;
	if(columns) {
		trHeader = document.createElement("TR");
		
		if(links) {
			var th = document.createElement("TH");
			th.textContent = "#";
			trHeader.appendChild(th);
		}
		
		for(var i=0; i!=columns.length; i++) {
			var column = columns[i];
		
			if(i==columns.length-1 && column.indexOf("json") === 0) {
				jsonColumnNames = [];
			}
			else {
				var th = document.createElement("TH");
				th.textContent = column;
				trHeader.appendChild(th);
			}
		}
		table.appendChild(trHeader);
	}
	
	if(data) {
		for(var i=0; i!=data.length; i++) {
			var tr = document.createElement("TR");
			var link = links ? links[i] : null;
			var row = data[i];
			
			if(links) {
				var td = document.createElement("TD");
				if(link) {
					var a = document.createElement("A")
					var img = document.createElement("IMG")
					a.href = link;
					//a.textContent="#";
					img.src = "img/drilldown.png";
					a.appendChild(img);
					td.appendChild(a);
				}
				else {
					td.textContent = "#";
				}
				tr.appendChild(td);
			}
			
			for(var j=0; j!=row.length; j++) {
				if(j!=row.length-1 || jsonColumnNames==null) {
					var td = document.createElement("TD");
					td.textContent = row[j];
					tr.appendChild(td);
				}
				else {
					var jsonText = row[j];
					var decoded = JSON.parse(jsonText);
					for(key in decoded) {
						if(jsonColumnNames.indexOf(key) < 0) {
							jsonColumnNames.push(key);
						}
					}
					
					for(var k=0; k!=jsonColumnNames.length; k++) {
						var jsonColumnName = jsonColumnNames[k];
						var td = document.createElement("TD");
						td.textContent = decoded[jsonColumnName];
						tr.appendChild(td);
					}
				}
			}
			table.appendChild(tr);
		}
	}
	if(jsonColumnNames) {
		for(var i=0; i!=jsonColumnNames.length; i++) {
			var jsonColumnName = jsonColumnNames[i];
		
			var th = document.createElement("TH");
			th.textContent = jsonColumnName;
			trHeader.appendChild(th);
		}
	}
	div.appendChild(table);
}
		

function bodyOnload() {
	
	displayObjectCall(datasourceName, objectName, objectType, owner);
	
	
	
}