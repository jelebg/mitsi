function adjustPanelSize() {
	var windowHW = getWindowHW();
	var datasourcePanel = gid("datasourcePanel");
	var datasourceFilter = gid("datasourceFilter");
	var rightPanel = gid("rightPanel");
	var vSeparator = gid("vseparator");
	var hSeparator = gid("hseparator");
	var sqlInput = gid("sqlinputGlobal");
	var sqlResult = gid("sqlresult");
	var sqlResultTable = gid("sqlresulttable");
	
	adjustToWindowH(datasourcePanel, windowHW);
	adjustToWindowH(vSeparator, windowHW);
	adjustRelativeX(datasourcePanel, vSeparator, 5);
	adjustRelativeX(vSeparator, rightPanel, 5);
	adjustToWindow(rightPanel, windowHW);
	adjustRelativeY(sqlinput, hseparator, 5);
	adjustRelativeY(hseparator, sqlresult, 5);
	adjustToWindow(sqlResult, windowHW);
	adjustToWindow(sqlResultTable, windowHW);

	//datasourceFilter.style.width = (datasourcePanel.style.width.replace("px", "")-10)+"px";
}

//var datasourcePrefix = "datasource-";
var datasourceUnrolledPrefix = "datasource-unrolled-"; 
//var datasourceObjectsPrefix = "datasource-objects-"; 
var datasourceColumnsUnrolledPrefix = "datasourcecolumns-unrolled-"; 
//function addDataSource(name, comment, tags, datasourceContext) {
function displayDatasource(datasourceName) {
	var datasourceContext = CONTEXT.getDatasource(datasourceName);
	var name = datasourceContext.name;
	var comment = datasourceContext.comment;
	var tags = datasourceContext.tags;
		
	var datasourcePanel = gid("datasourcePanel");
	//var divId = datasourcePrefix+name;
	
	var o = document.createElement("OPTION");
	o.value = name;
	o.text = name;
	gid("runSQLDatasourceSelect").appendChild(o);
	
	datasourceContext.div = document.createElement("DIV");
//	datasourceContext.div.id = divId;
	datasourceContext.div.className = "datasource";
	datasourceContext.div.style.width = "100%";
	datasourceContext.div.title = comment;
	
	var divName = document.createElement("DIV");
	divName.className = "datasourceName";
	divName.style.width = "100%";
	divName.textContent = name;
	
	/*var imgUnroll = document.createElement("IMG");
	imgUnroll.src = "img/unroll.png";
	var aUnroll = document.createElement("A");
	aUnroll.href = "";*/
	/* aUnroll.onclick = function(event) { 
		//alert("unroll:"+divId);
		unrollDatasource(this, event, name); 
		return false; 
	};*/
	/*aUnroll.appendChild(imgUnroll);
	aUnroll.style.position = "absolute";
	aUnroll.style.right = "10px";
	
	//var imgMenu = document.createElement("IMG");
	//imgMenu.src = "img/unroll.png";
	var aMenu = document.createElement("A");
	aMenu.textContent = "...";
	aMenu.href = "";
	aMenu.onclick = function(event) { showDatasourceMenu(this, event, name); event.stopPropagation(); return false; };
	//aMenu.appendChild(imgMenu);
	aMenu.style.position = "absolute";
	aMenu.style.right = "40px";
*/

	datasourceContext.smallMenu = new MitsiPanelSmallMenu(datasourceContext.div,
		"20px",
		25,
		7,
		[{ title:"unroll", imgsrc:"img/unroll.png" },
		 //{ title:"search", imgsrc:"img/search.png" },
		 { title:"menu", imgsrc:"img/menu.png"     },
		 { title:"details", imgsrc:"img/details.png"     },
		 { title:"refresh", imgsrc:"img/refresh.png"     },
		 { title:"connect", imgsrc:"img/connected-false.png", toggleimg:"img/connected-true.png", toggled:datasourceContext.connected }
		]);
	//datasourceSmallMenu.getDiv(1).onclick = function(event) { alert("search"); return false; };
	datasourceContext.smallMenu.setOnClick(1, function(event) { 
		//showDatasourceMenu(datasourceSmallMenu.getDiv(2), event, name); 
		//try {
		// TODO : à refaire en générique de toute façon, ici ne marchera à cause du scope de la fonction
			datasourcePopupMenu.show(name, 
					datasourceContext.smallMenu.getDiv(1), 
				[ { label:"menu de "+name , title:"title de "+name } ]);
		//}
		//catch (e) {
		//	console.log(e);
		//}
		event.stopPropagation();
		//return false; 
	});
	datasourceContext.smallMenu.setOnClick(2, 
			createOnClickShowDatasourceDetail("details.datasource."+name, 
					datasourceContext.smallMenu.getDiv(3), 
												name));
	datasourceContext.smallMenu.setOnClick(3, 
			createOnClickRefreshDatasource(name));
	datasourceContext.smallMenu.setOnClick(4, 
			createOnClickConnectDatasource(name));


	datasourceContext.divTags = document.createElement("DIV");
	datasourceContext.divTags.className = "datasourceTags";
	datasourceContext.divTags.style.width = "100%";
	datasourceContext.divTags.textContent = tags==null ? "" : tags.join(", ");
	
	
	datasourceContext.divUnrolled = document.createElement("DIV");
	datasourceContext.divUnrolled.id = datasourceUnrolledPrefix+name;
	datasourceContext.divUnrolled.style.width = "100%";

	var divUnrolledButtons = document.createElement("DIV");
	
	var t = document.createElement("TABLE");
	t.className = "datasourceFilterTable";
	var tr = document.createElement("TR");
	// TODO : faire un widget ad hock
	var td1 = document.createElement("TD");
	var td2 = document.createElement("TD");
	var td3 = document.createElement("TD");
	var td4 = document.createElement("TD");
	t.style.width = "100%";
	td4.style.width = "100%";
	td4.style.paddingRight = "6px";
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	tr.appendChild(td4);
	t.appendChild(tr);
	divUnrolledButtons.appendChild(t);
	
	datasourceContext.schemaList = document.createElement("SELECT");
	datasourceContext.schemaList.className = "schemaSelect";
	datasourceContext.schemaList.style.width = "100%";
	//var schemas = ["SCHEMA_TUTU", "SCHEMA_TATA", "*"];
	
	datasourceContext.schemaList.onchange = function(event) {
		changeCurrentSchema(datasourceName);
	}
	
	displaySchemas(datasourceContext);
	divUnrolledButtons.appendChild(datasourceContext.schemaList);

	
	//divUnrolledButtons.style.verticalAlign = "middle"; 
	var divUnrolledButton1 = document.createElement("BUTTON");
	var divUnrolledButton2 = document.createElement("BUTTON");
	var divUnrolledButton3 = document.createElement("BUTTON");
	//divUnrolledButton1.style.verticalAlign = "middle"; 
	//divUnrolledButton2.style.verticalAlign = "middle"; 
	//divUnrolledButton3.style.verticalAlign = "middle"; 

	divUnrolledButton1.title = "display/hide tables";
	datasourceContext.toggleTable = new MitsiToggle(true, "img/table.png", "16px", divUnrolledButton1, createOnFilterDatasource(name) );
	divUnrolledButton2.title = "display/hide views";
	datasourceContext.toggleView = new MitsiToggle(true, "img/view.png", "16px", divUnrolledButton2, createOnFilterDatasource(name) );
	divUnrolledButton3.title = "display/hide materialized views";
	datasourceContext.toggleMatView = new MitsiToggle(true, "img/matview.png", "16px", divUnrolledButton3, createOnFilterDatasource(name)  );

	/*divUnrolledButtons*/td1.appendChild(divUnrolledButton1);
	/*divUnrolledButtons*/td2.appendChild(divUnrolledButton2);
	/*divUnrolledButtons*/td3.appendChild(divUnrolledButton3);
	datasourceContext.filter = new DynamicFilter(/*ivUnrolledButtons*/ td4, "", "filter tables/cols here ...", 
			createOnFilterDatasource(name));
	datasourceContext.divUnrolled.appendChild(divUnrolledButtons);
	
	
	datasourceContext.accordion = new MitsiAccordion(datasourceContext.divUnrolled,
				datasourceUnrolledPrefix,
				datasourceContext.smallMenu.getDiv(0),
				false,
				true);
	
	datasourceContext.divAllTables = document.createElement("DIV");
	//datasourceContext.divAllTables.id=datasourceObjectsPrefix+name;
	datasourceContext.divUnrolled.appendChild(datasourceContext.divAllTables);

	/* var columns = ["ID", "NAME", "COL1", "COL2", "COL3", "COL4", "COL4", "COL5", "COL6"];
	var tables = ["CLIENTS", "FOURNISSEURS", "EMPLOYES", "CAMIONS", "PELLES", "RATEAUX"];
	
	// TODO : à supprimer
	for(var ti=0; ti!=tables.length; ti++) {
		var divTable = document.createElement("DIV");
		divTable.className = "datasourceTable";
		divTable.style.width = "100%";
		divTable.textContent = tables[ti];

		/*var imgColUnroll = document.createElement("IMG");
		imgColUnroll.src = "img/unroll.png";
		var aColUnroll = document.createElement("A");
		aColUnroll.href = "";
		aColUnroll.appendChild(imgColUnroll);
		aColUnroll.style.position = "absolute";
		aColUnroll.style.right = "10px";
		divUnrolled.appendChild(aColUnroll);
		* /
		var smallMenu = new MitsiPanelSmallMenu(divTable,
			"16px",
			20,
			[{ title:"unroll", imgsrc:"img/unroll.png" 		},
			 { title:"search", imgsrc:"img/search.png" 		},
			 { title:"menu", imgsrc:"img/menu.png"     		}, 
			 { title:"details", imgsrc:"img/details.png"    },
			 { title:"table datas", imgsrc:"img/table.png"  } 
			]);
		smallMenu.getDiv(1).onclick = function() { alert("search"); return false; };
		smallMenu.getDiv(2).onclick = function() { alert("menu"); return false; };
		smallMenu.getDiv(3).onclick = createOnClickShowTableDetail("details.table."+name+"."+tables[ti], smallMenu.getDiv(3), name, tables[ti]);
		smallMenu.getDiv(4).onclick = createOnClickShowTable("data.table."+name+"."+tables[ti], smallMenu.getDiv(3), name, tables[ti]);
		
		divAllTables.appendChild(divTable);

		var divCols = document.createElement("DIV");
		divCols.className = "datasourceColumns";
		divCols.style.width = "100%";
		
		for(var ci=0; ci!=columns.length; ci++) {
			var divCol = document.createElement("DIV");
			divCol.className = "datasourceColumn";
			divCol.style.width = "100%";
			divCol.textContent = tables[ti].substring(0, 3)+"_"+columns[ci];
			divCols.appendChild(divCol);
		}
		divAllTables.appendChild(divCols);
		
		new MitsiAccordion(divCols,
			datasourceColumnsUnrolledPrefix,
			//aColUnroll,
			smallMenu.getDiv(0),
			false,
			false);

	}
	
	//div.appendChild(aUnroll);
	//div.appendChild(aMenu);
	*/
	
	// TODO : schémas
	
	datasourceContext.div.appendChild(divName);
	datasourceContext.div.appendChild(datasourceContext.divTags);
	datasourceContext.div.appendChild(datasourceContext.divUnrolled);
	datasourcePanel.appendChild(datasourceContext.div);
	
}

function displaySchemas(datasourceContext) {
	datasourceContext.schemaList.innerHTML = "";
	if(datasourceContext.schemas) {
		for(var i=0; i!=datasourceContext.schemas.length; i++) {
			var o = document.createElement("OPTION");
			o.text  = datasourceContext.schemas[i].name;
			o.value = datasourceContext.schemas[i].name;
			if(datasourceContext.schemas[i].current) {
				o.selected = true;
				datasourceContext.currentSchema = datasourceContext.schemas[i].name;
			}
			datasourceContext.schemaList.appendChild(o);
		}
	}

}

function displayDatabaseObjects(datasourceName) {
	var datasource = CONTEXT.getDatasource(datasourceName);
	var objects = datasource.objects;
	//var divObjects = gid(datasourceObjectsPrefix+datasourceName);
	
	displaySchemas(datasource);
	
	var divAllTables = datasource.divAllTables;
	
	divAllTables.innerHTML = "";
	
	for(var ti=0; ti!=objects.length; ti++) {
		var table = objects[ti];
		
		if(datasource.currentSchema && datasource.currentSchema != table.id.schema) {
			continue;
		}
		
		var divTable = document.createElement("DIV");
		divTable.className = "datasourceTable";
		divTable.style.width = "100%";
		//divTable.textContent = table.id.name; // TODO :recopier les autres champs qqpart ...
		
		var divImg = document.createElement("IMG");
		divImg.style.verticalAlign = "middle";
		divImg.style.paddingRight = "5px";
		switch(table.id.type) {
		case "table" :
			divImg.src = "img/table.png";
			break;
		case "view" :
			divImg.src = "img/view.png";
			break;
		case "matview" :
			divImg.src = "img/matview.png";
			break;
		default :
			divImg.src = "img/question.png";
		}
		var textNodeTableName = document.createTextNode(table.id.name);
		divTable.appendChild(divImg);
		divTable.appendChild(textNodeTableName);
		
		
		if(table.description) {
			divTable.title = table.description;
		}

		// store in context the div (to display or hide)
		table.divTable = divTable;

		/*var imgColUnroll = document.createElement("IMG");
		imgColUnroll.src = "img/unroll.png";
		var aColUnroll = document.createElement("A");
		aColUnroll.href = "";
		aColUnroll.appendChild(imgColUnroll);
		aColUnroll.style.position = "absolute";
		aColUnroll.style.right = "10px";
		divUnrolled.appendChild(aColUnroll);
		*/
		var smallMenu = new MitsiPanelSmallMenu(divTable,
			"16px",
			20,
			7,
			[{ title:"unroll", imgsrc:"img/unroll.png" 		},
			 { title:"links", imgsrc:"img/proxgraph.png" 		},
			 { title:"menu", imgsrc:"img/menu.png"     		}, 
			 { title:"details", imgsrc:"img/details.png"    },
			 { title:"table datas", imgsrc:"img/table.png"  } 
			]);
		smallMenu.getDiv(1).onclick = createOnClickShowTableLinks("links.table."+datasourceName+"."+table.id.name, smallMenu.getDiv(1), datasourceName, table.id.schema, table.id.type, table.id.name);
		smallMenu.getDiv(2).onclick = function() { alert("menu"); return false; };
		smallMenu.getDiv(3).onclick = createOnClickShowTableDetail("details.table."+datasourceName+"."+table.id.name, smallMenu.getDiv(3), datasourceName, table.id.schema, table.id.type, table.id.name);
		smallMenu.getDiv(4).onclick = createOnClickShowTable("data.table."+datasourceName+"."+table.id.name, smallMenu.getDiv(3), datasourceName, table.id.schema, table.id.name);
		
		divAllTables.appendChild(divTable);

		table.divColumns = document.createElement("DIV");
		table.divColumns.className = "datasourceColumns";
		table.divColumns.style.width = "100%";
		
		var columns = table.columns;
		for(var ci=0; ci!=columns.length; ci++) {
			var column = columns[ci];
			var divCol = document.createElement("DIV");
			divCol.className = "datasourceColumn";
			divCol.style.width = "100%";
			divCol.textContent = column.name; // TODO : et les autres propriétés
			table.divColumns.appendChild(divCol);
		}
		divAllTables.appendChild(table.divColumns);
		
		new MitsiAccordion(table.divColumns,
			datasourceColumnsUnrolledPrefix,
			//aColUnroll,
			smallMenu.getDiv(0),
			false,
			false);

	}
}

// workaround à cause de la portée des variables qui est au
// niveau de la fonction, c'est horrible mais c'est comme ça

function createOnFilterDatasource(datasourceName) {
	return function() {
		try {
			var datasourceContext = CONTEXT.getDatasource(datasourceName);
			if(!datasourceContext.objects) {
				return;
			}
			var filterTable = datasourceContext.toggleTable.value;
			var filterView = datasourceContext.toggleView.value;
			var filterMatView = datasourceContext.toggleMatView.value;
			var filterText = datasourceContext.filter.getValue();
			//alert(filterText);
			var regex = null;
			if(filterText != null) {
				regex = new RegExp(filterText, "i");
			}	
			
			//alert(filterTable+" "+filterView+" "+filterMatView);
			for(var i=0; i!=datasourceContext.objects.length; i++) {
				var obj = datasourceContext.objects[i];
				//console.log(obj.id.name + ":" + obj.id.type);
				var type = obj.id.type;
				var divTable = obj.divTable;
				var divColumns = obj.divColumns;
				
				var display = false;
				
				if( (filterTable && type=="table") ||
						(filterView && type=="view") ||
						(filterMatView && type=="matview") ) {
					if(regex==null) {
						display = true;
					} else if(obj.id.name.match(regex)) {
						display = true;
					}
					else {
						for(var j=0; j!=obj.columns.length; j++) {
							console.log("col:"+obj.columns[j].name);
							if(obj.columns[j].name.match(regex)) {
								display = true;
								break;
							}
						}
					}
					
				}
				
				if(display) {
					divTable.style.display = "block";
					//divColumns.style.display = "block";
				}
				else {
					divTable.style.display = "none";
					divColumns.style.display = "none";
				}
				
				// TODO : filtrer aussi sur les colonnes, indexs, partitions, etc.
			}
		}
		catch (e) {
			console.log(e);
		}
		return false; 
	}	
}

function createOnClickShowDatasourceDetail(detailScreenId, div, datasource) {
	return function(event) {
		try {
			detailScreen.show(detailScreenId,
						"details?datasource="+datasource,
						div); 
			event.stopPropagation();
		}
		catch (e) {
			console.log(e);
		}
		return false; 
	}
}
function createOnClickShowTableDetail(detailScreenId, div, datasource, owner, objectType, objectName) {
	return function(event) {
		try {
			detailScreen.show(detailScreenId,
						"details?datasource="+datasource+"&type="+objectType+"&owner="+owner+"&name="+objectName,
						div); 
		}
		catch (e) {
			console.log(e);
		}
		event.stopPropagation();
		return false; 
	}
}
function createOnClickShowTableLinks(detailScreenId, div, datasource, owner, objectType, objectName) {
	return function(event) {
		try {
			detailScreen.show(detailScreenId,
						"links?datasource="+datasource+"&type="+objectType+"&owner="+owner+"&name="+objectName,
						div); 
		}
		catch (e) {
			console.log(e);
		}
		event.stopPropagation();
		return false; 
	}
}

function refreshDatasource(datasource) {
	var datasourceContext = CONTEXT.getDatasource(datasource);
	var select = datasourceContext.schemaList;
	if(select.selectedIndex >= 0) {
		var schema = select.options[select.selectedIndex].value;
	}
	
	callGsonServlet("GetDatabaseObjectsServlet", 
			{
				"datasourceName" : datasource,
				"schema" : schema
			},
			function(response) { 
				console.log(response);
				CONTEXT.setDatasourceObjects(datasource, response.databaseObjects);
				CONTEXT.getDatasource(datasource).schemas = response.schemas;
				displayDatabaseObjects(datasource);
				
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);
}

function createOnClickRefreshDatasource(datasource) {
	return function(event) {
		
		try {
			refreshDatasource(datasource);
		}
		catch (e) {
			console.log(e);
		}
		return false;
	}
}

function connectDatasource(datasource) {
	callGsonServlet("ConnectServlet", 
			{
				"datasourceName" : datasource
			},
			function(response) { 
				console.log(response);
				if(response.connected) {
					//alert("connected !");
					EVENT_datasourceConnection(datasource);
				}
				else {
					alert("connection failed : "+response.errorMessage);
					cancelToggle();
				}
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);	
}

function createOnClickConnectDatasource(datasource) {
	return function(event, connected, cancelToggle) {
		
		try {
			if(connected) {
				connectDatasource(datasource);
			}
			else {
				callGsonServlet("DisconnectServlet", 
						{
							"datasourceName" : datasource
						},
						function(response) { 
							console.log(response);
							
							EVENT_datasourceDisconnection(datasource);
							// TODO : que faire si la disconnexion a échoué ? à priori le mieux c'est d'ignorer ...
							
							//if(response.disconnected) {
								//alert("disconnected !");
							//}
							//else {
								//alert("not disconnected :( : "+response.warningMessage);
							//}
						}, 
						function(code, text) { 
							console.log("error code="+code+" text="+text); 
							alert("error code="+code+" text="+text); 
						}
					);
			}
		}
		catch (e) {
			console.log(e);
		}
		return false; 
	}
}

function createOnClickShowTable(detailScreenId, div, datasource, owner, table) {
	return function(event) {
		try {
			detailScreen.show(detailScreenId,
						"table?datasource="+datasource+"&owner="+owner+"&name="+table,
						div); 
		}
		catch (e) {
			console.log(e);
		}
		event.stopPropagation();
		return false; 
	}
}

function datasourceFilterOnChange(text) {
	if(text == "") {
		text = null;
	}
	
	var regex = null;
	if(text != null) {
		regex = new RegExp(text, "i");
	}
	
	var datasources = CONTEXT.datasources;
	for(var datasourceName in datasources) {
		var datasource = datasources[datasourceName];
		
		var display = false;
		if(regex == null) {
			display = true;
		}
		else {
			if(datasource.name.match(regex)) {
				display = true;
			}
			else if(datasource.description && datasource.description.match(regex)) {
				display = true;
			}
			else {
				if(datasource.tags) {
					for(var i=0; i!=datasource.tags.length; i++) {
						var tag = datasource.tags[i];
						if(tag && tag.match(regex)) {
							display = true;
							break;
						}
					}
				}
			}
		}
		
		console.log("display "+datasource.name+" "+display);
		if(display) {
			datasource.div.style.display = "block";
			datasource.divTags.style.display = "block";
			datasource.divAllTables.style.display = "block";
		}
		else {
			datasource.div.style.display = "none";
			datasource.divAllTables.style.display = "none";
			datasource.divTags.style.display = "none";
			datasource.divUnrolled.style.display = "none";
		}
	}
}


var hightlightToggle = null;
var datasourcePopupMenu = null;
var detailScreen = null;
var datasourceFilter = null;
var ftextSqlInput = null;
function bodyOnLoad() {
	datasourceFilter = new DynamicFilter(gid("datasourceFilterDiv"),
			"",
			"filter datasource here by name / tag / comment",
			datasourceFilterOnChange);
			
	
	hightlightToggle = new MitsiToggle(
		false, 
		"img/toggle_hightlight_3_true.png",
		null,
		gid("btnHighlight"), 
		null
	);
	datasourcePopupMenu = new PopupMenu(
		"datasourcePopupMenu", 
		gid("around"),
		"200px",
		[ {label:"menu 1", title:"title 1"},
		  {label:"menu 2", title:"title 2"},
		  {label:"menu 3", title:"title 3"},
		  {label:"menu 4", title:"title 4"}
		]
	);
	detailScreen = new PopupDetailsScreen(
		"detailsScreen",
		gid("around"),
		gid("around"),
		15,
		15
	);
		
	ftextSqlInput = new FText(gid("sqlinput"), gid("sqlLineNumber"));

	//highlight();
	adjustPanelSize();
	
	vSeparatorFor(gid("vseparator"), [gid("datasourcePanel")], [gid("rightPanel"), gid("sqlresulttable")]);
	hSeparatorFor(gid("hseparator"), [gid("sqlinputGlobal")], [gid("sqlresult"), gid("sqlresulttable")]);
	
	//highlightTimeout();
	
	//initSqlResult();
	
	/*addDataSource("MONPROJET-ENV-DE-RECETTE", "Réservé à l'équipe de recette", ["MonProjet", "Recette", "Attention!!"]);
	addDataSource("MONPROJET-ENV-DE-DEV", "Réservé aux devs", ["MonProjet", "dev"]);
	addDataSource("MONPROJET-ENV-DE-PREPROD", "Réservé aux équipes de prod", ["MonProjet", "PreProd", "Attention!!"]);
	addDataSource("AUTREPROJET-ENV-DE-RECETTE", "Réservé à l'équipe de recette", ["AutreProjet", "Recette", "Attention!!"]);
	*/
	
	callGsonServlet("GetClientStatusServlet", 
			{
			},
			function(response) { 
				console.log(response);
				if(response.datasources != null) {
					CONTEXT.setDatasourceList(response.datasources);
					
					for(var i=0; i!=response.datasources.length; i++) {
						var datasource = response.datasources[i];
						//var datasourceCtx = CONTEXT.getDatasource(datasource.name);
						//addDataSource(datasource.name, datasource.description, datasource.tags, datasourceCtx);
						displayDatasource(datasource.name);
						if(datasource.connected) {
							EVENT_DatasourceUpdate(datasource.name);
						}
					}
				}
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);
}



function sqlInputOnKey(event) {
	//console.log(event.keyCode);
	if(event.keyCode == 13 || event.keyCode == 8 || event.keyCode == 46 ||
		event.ctrlKey&&(event.key=="v" ||event.key=="x")) {
		ftextSqlInput.updateLineNumbers();
	}

	if(event.keyCode == 120) { // F9 key
		if(event.ctrlKey) { // ctrl-F9
			console.log("XPLAN for : '"+getSqlInputOne()+"'");
		}
		else if(event.altKey) { // alt-F9
			console.log("TRACE FOR : '"+getSqlInputOne()+"'");
		}
		else { // F9 only
			//console.log("RUN : '"+getSqlInputOne()+"'");
			runSQL();
		}
	}
}

var nbRowsToFetchGlobal = 100;
function runSQL() {
	var sql = getSqlInputOne();
	sql = sql.trim();
	var runSQLDatasourceSelect = gid("runSQLDatasourceSelect");
	var datasource = runSQLDatasourceSelect.options[runSQLDatasourceSelect.selectedIndex].value;
	console.log("runSQL on datasource '"+datasource+"' : '"+sql+"'");
	
	if(!datasource || datasource=="") {
		return;
	}
	
	callGsonServlet("RawSQLBeginServlet", 
			{
				"datasourceName" : datasource,
				"nbRowToFetch"   : nbRowsToFetchGlobal, // TODO : à rendre paramétrable
				"sql"            : sql
			},
			function(response) { 
				console.log(response);
				
				CONTEXT.handsontableData = response.results;
				CONTEXT.handsontable = sqlTableInit(gid("sqlresulttable"), 
						response.columns, 
						CONTEXT.handsontableData, 
						(CONTEXT.handsontableData.length < nbRowsToFetchGlobal),
						runSQLFetchMore);
				
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);
	
}


function runSQLFetchMore() {
	var runSQLDatasourceSelect = gid("runSQLDatasourceSelect");
	var datasource = runSQLDatasourceSelect.options[runSQLDatasourceSelect.selectedIndex].value;
	callGsonServlet("RawSQLFetchServlet", 
			{
				"datasourceName" : datasource,
				"nbRowToFetch"   : nbRowsToFetchGlobal // TODO : à rendre paramétrable
			},
			function(response) { 
				console.log(response);
				
				sqlTableDisplayMore(CONTEXT.handsontable, CONTEXT.handsontableData, response.results, (response.results.length < nbRowsToFetchGlobal));
				
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);

}

function changeCurrentSchema(datasourceName) {
	// TODO :est-ce vraiment nécessaire pour la connexion spécifique MITSI ? appeler directement  EVENT_DatasourceSchemaChange ?
	
	var datasourceContext = CONTEXT.getDatasource(datasourceName);
	var select = datasourceContext.schemaList;
	var schema = select.options[select.selectedIndex].value;

	callGsonServlet("ChangeCurrentSchemaServlet", 
			{
				"datasource" : datasourceName,
				"schema"         : schema 
			},
			function(response) { 
				console.log(response);
				
				datasourceContext.currentSchema = schema;
				EVENT_DatasourceSchemaChange(datasourceName);
				
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);

	
	
}
