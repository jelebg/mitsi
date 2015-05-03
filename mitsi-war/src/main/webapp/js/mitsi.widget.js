// Toggle Boutton, pour �viter les checkbox moches
// object to store the status
function MitsiToggle(defaut, imageName, imgHeight, button, onafterchange) {
	this.value = defaut;
	this.button = button;
	//this.imageStroke = document.createElement("IMG");
	
	this.div = document.createElement("DIV");
	this.div.style.position = "relative";
	this.image = document.createElement("IMG");
	//this.imageStroke.style.display = "block";
	this.image.src = imageName;
	if(imgHeight) {
		this.div.style.height = imgHeight;
		this.image.style.height = imgHeight;
	}
	if(defaut) {
		this.div.setAttribute("style",
				(imgHeight ? "height:"+imgHeight+";" : "" )
			);
	}
	else {
		this.div.setAttribute("style",
				(imgHeight ? "height:"+imgHeight+";" : "" ) +
				"-webkit-filter:grayscale(100%);"+
				"filter:grayscale(100%);"+
				"opacity:0.5"
			);
	}

	//this.imageStroke.src = "img/toggle_redcross.png";
	//this.imageStroke.style.display = "block";
	//this.imageStroke.style.position = "absolute";
	//this.imageStroke.style.left = "0px";
	//this.imageRedCross.style.top = "0px";
	//if(this.value == true) {
	//	this.imageStroke.style.display = "none";
	//}
	this.div.appendChild(this.image);
	//this.div.appendChild(this.imageStroke);
	button.appendChild(this.div);
	
	var toggleObject = this;
	
	button.onclick = function() {
		if(toggleObject.value == true) {
			toggleObject.value = false;
			//toggleObject.imageStroke.style.display = "block";
			//toggleObject.image.style.filter = "grayscale(100%)";
			//opacity: 0.4;
			toggleObject.div.setAttribute("style",
						(imgHeight ? "height:"+imgHeight+";" : "" ) +
						"-webkit-filter:grayscale(100%);"+
						"filter:grayscale(100%);"+
						"opacity:0.5"
					);
		}
		else {
			toggleObject.value = true;
			//toggleObject.imageStroke.style.display = "none";
			toggleObject.div.setAttribute("style", (imgHeight ? "height:"+imgHeight+";" : "" ) );
		}
		
		if(onafterchange) {
			onafterchange(toggleObject);
		}
	};
}

// accordions
function MitsiAccordion(
				div,          // the div to roll/unroll
				group,        // string identifying all of the accordions linked
				unrollButton, // the button to unroll the accordion
				initUnrolled,  // true if the accordion is displayed on initialisation
				neverMoreThanOneUnrolled
			) {
// nothing stored in object, for now
	this.group = group;

	div.className += " "+group;
			
	if(initUnrolled === true) {
		div.style.display = "block";
	}
	else {
		div.style.display = "none";
	}

	var obj = this;
	unrollButton.onclick = function(event) {
		var unroll = (div.style.display == "none");
		if(neverMoreThanOneUnrolled === true)  {
			obj.windAll();
		}
		if(unroll) {
			div.style.display = "block";
		} else 	if(neverMoreThanOneUnrolled !== true) {
			div.style.display = "none";
		}

		
		return false;
	};
	
	this.windAll = function() {
		mitsiAccordionWindAll(this.group);
	}

}

// static function for accordions
function mitsiAccordionWindAll(group) {
	var divs = document.getElementsByClassName(group);
	if(divs) {
		for(var i=0; i!=divs.length; i++) {
			var d = divs[i];
			if(d.style.display != "none") {
				d.style.display = "none";
			}
		}
	}
}
		
		
// small menu button at top right of the div
function MitsiPanelSmallMenu(parentdiv, 
	height,
	imgWidth,
	space, // space on the right of the first button
	menus // array of {title, imgsrc, onclick, toggled, toggleimg}
	) {
	this.divs = [];
	this.toggled = [];
	this.menus = menus;
	
	//var space = 5;

	
	this.createOnClickToggled = function(i, img) {
		var othis = this;
		return function(event) {
			try {
				if(othis.toggled[i] == true) {
					othis.toggled[i] = false;
					img.src = othis.menus[i].imgsrc;
				}
				else {
					othis.toggled[i] = true;
					img.src = othis.menus[i].toggleimg;
				}
			 
				//var success = true;
				if(othis.menus[i].onclick) {
					othis.menus[i].onclick(
							event, 
							othis.toggled[i], 
							function cancelToggle() {
								if(othis.toggled[i] == true) {
									othis.toggled[i] = false;
									img.src = othis.menus[i].imgsrc;
								}
								else {
									othis.toggled[i] = true;
									img.src = othis.menus[i].toggleimg;
								}
							}
					);
				}
				
			}
			catch(e) {
				console.log(e);
			}
				
			return false; 
		};
	}

	this.createOnClick = function(i) {
		var othis = this;
		return function(event) {
			if(othis.menus[i].onclick) {
				othis.menus[i].onclick(event);
			}
			return false; 
		};
	}
	
	
	for(var i=0; i!=menus.length; i++) {
		var menu = menus[i];
		
		var img = document.createElement("IMG");
		img.src = menu.toggled ? menu.toggleimg : menu.imgsrc;
		img.style.height = height;

		var a = document.createElement("A");
		a.href = "";
		a.appendChild(img);
		if(menu.title) {
			a.title = menu.title;
		}
		a.style.position = "absolute";
		a.style.right = (imgWidth*i+space)+"px";
		if(menu.toggleimg) {
			a.onclick = this.createOnClickToggled(i, img); 
		}
		else {
			a.onclick = this.createOnClick(i);
		} 
		
		this.toggled[i] = menu.toggled;
		
		parentdiv.appendChild(a);
		this.divs[i] = a;
	}


	this.getDiv = function(i) {
		return this.divs[i];
	}
	
	this.setOnClick = function(i, f) {
		menus[i].onclick = f;
	}


}


// popup - menu
function PopupMenu(
			id, //  id of the menu div
			parentElement, // parent of the div
			width, // width of the div
			menus // array of {label, title};
		) {
	this.parentElement = parentElement;
	this.menus = menus;
	this.menuDivs = [];
	this.id = id;
	this.width = width;
	this.currentSubId = null;
	this.divMenu = null;
	
	this.addMenu = function(menu) {
		var line = document.createElement("DIV");
		line.style.width = "100%";
		
		var a = document.createElement("A");
		a.textContent = menu.label;
		a.title = menu.title;
		a.href = "";
		a.onclick = function() { return false; };
		
		line.appendChild(a);
		this.divMenu.appendChild(line);
	}
	
	this.show = function(subId, anchorElement, otherMenus) {
		if(subId == this.currentSubId) {
			this.hide();
			return;
		}
		this.hide();
		
		var anchorXY = getAbsoluteXY(anchorElement);
		//var dataSourcePanelXY = getAbsoluteXY(parent);
		
		this.divMenu = document.createElement("DIV");
		this.divMenu.id = this.id;
		this.divMenu.className = "popupMenu";
		this.divMenu.style.position = "absolute";
		this.divMenu.style.top = (anchorXY.y/*-dataSourcePanelXY.y*/+anchorElement.offsetHeight)+"px";
		this.divMenu.style.left = (anchorXY.x/*-dataSourcePanelXY.x*/)+"px";
		this.divMenu.style.width = this.width;
		this.divMenu.style.zIndex = "1000";

		if(this.menus) {
			for(var i=0; i!=this.menus.length; i++) {
				this.addMenu(this.menus[i]);
			}
		}
		if(otherMenus) {
			for(var i=0; i!=otherMenus.length; i++) {
				this.addMenu(otherMenus[i]);
			}
		}
		
		this.parentElement.appendChild(this.divMenu);
		this.currentSubId = subId;
	}
	
	this.hide = function() {
		var oldMenu = gid(this.id);
		if(oldMenu) {
			var parent = oldMenu.parentElement;
			parent.removeChild(oldMenu);
		}
		this.divMenu = null;
		this.currentSubId = null;
	};
}

// Popup details screen
function PopupDetailsScreen(
		id, 			// div id
		parentElement,
		topAlignDiv,
		spaceRightToWindow,
		spaceBottomToWindow	) {
	this.id = id;
	this.parentElement = parentElement;
	this.topAlignDiv = topAlignDiv;
	this.spaceRightToWindow = spaceRightToWindow;
	this.spaceBottomToWindow = spaceBottomToWindow;
	this.div = null;
	this.currentSubId = null;
	
	var othis = this;
	this.show = function(subId, 
			url,
			leftAlignDiv) {
		if(subId == this.currentSubId) {
			this.hide();
			return;
		}
		this.hide();

		this.currentSubId = subId;

		var alignLeft = getAbsoluteXY(leftAlignDiv).x +leftAlignDiv.offsetWidth + 20;
		var alignTop  = getAbsoluteXY(this.topAlignDiv).y  +this.topAlignDiv.offsetHeight;
		var windowHW  = getWindowHW();

		// todo : prendre en compte la position du parent
		var top    = alignTop;
		var left   = alignLeft;
		var height = windowHW.h-top-this.spaceBottomToWindow;
		var width  = windowHW.w-left-this.spaceRightToWindow;
		
		this.div = document.createElement("DIV");
		this.div.id = this.id;
		this.div.className = "detailWindow";
		this.div.style.position = "absolute";
		this.div.style.top    = top+"px";
		this.div.style.left   = left+"px";
		this.div.style.width  = width+"px";
		this.div.style.height = height+"px";
		this.div.style.zIndex = "900";
		
		var iframe = document.createElement("IFRAME");
		iframe.src = url;
		var marginTop = 22;
		var margin = 10;
		iframe.style.marginTop = marginTop+"px";
		iframe.style.marginLeft = margin+"px";
		iframe.style.marginRight = margin+"px";
		iframe.style.marginBottom = margin+"px";
		iframe.style.height = (height-margin-marginTop)+"px";
		iframe.style.width  = (width-2*margin)+"px";
		this.div.appendChild(iframe);
		
		this.parentElement.appendChild(this.div);
		var smallMenu = new MitsiPanelSmallMenu(this.div,
		"20px",
		25,
		10,
		[{ title:"open in new window", imgsrc:"img/newwindow.png" },
		 { title:"refresh", imgsrc:"img/refresh.png" },
		 { title:"forward", imgsrc:"img/right.png" },
		 { title:"back", imgsrc:"img/left.png" },
		 { title:"close popup", imgsrc:"img/bluecross.png" }
		]);
		smallMenu.getDiv(0).onclick = newFunctionGotoUrl(url);
		smallMenu.setOnClick(1, function(event) {
			iframe.src = iframe.src;
			event.stopPropagation();
			return false;
		});
		smallMenu.setOnClick(2,  function(event) {
			try {
				iframe.contentWindow.history.forward();
			}
			catch(e) {
				console.log(e);
			}
			event.stopPropagation();
			return false;
		});
		smallMenu.setOnClick(3,  function(event) {
			try {
				iframe.contentWindow.history.back();
			}
			catch(e) {
				console.log(e);
			}
			event.stopPropagation();
			return false;
		});
		smallMenu.setOnClick(4,  function(event) {
			othis.hide();
			event.stopPropagation();
			return false;
		});
		
	}

	this.hide = function() {
		if(this.div) {
			this.parentElement.removeChild(this.div);
		}
		this.div = null;
		this.currentSubId = null;
	};

}

function newFunctionGotoUrl(url) {
	return function(event) {
		window.open(url);
		return false;
	};
}

// filtre dynamique pour filtrer pendant la frappe
var dynamicFilterMinIntervalMilliSec = 500; // 0.5 sec
function DynamicFilter(div, style, emptyMessage, onchange, categories) {
	this.div = div;
	this.div2 = document.createElement("DIV");
	//this.div2.style.position = "absolute";
	this.div.appendChild(this.div2);
	this.onchange = onchange;
	//this.lastOnChangeCallDate = null;
	this.lastOnChangeSetTimeoutHandle = null;
	this.lastOnChangeValue = null;
	this.categories = categories;
	
	//var div2 = document.createElement("DIV");
	//div2.style.display = "inline-block";
	//div2.style.width = "100%";
	
	this.input = document.createElement("INPUT");
	this.input.type = "text";
	this.input.className = "mitsiFilter";
	this.input.setAttribute("style", style);
	//this.input.style.display = "inline-block";
	this.input.style.width = "100%";
	this.input.style.color = "grey";
	this.input.value = emptyMessage;

	var div3 = document.createElement("DIV");
	div3.style.position = "absolute";
	div3.style.right = "2px";
	div3.style.marginTop	 = "2px";
	var a = document.createElement("A");
	a.href = "";
	var img = document.createElement("IMG");
	img.src = "img/greycross.png";
	var othis = this;
	a.onclick = function (event) { 
		othis.emptyValue();
		return false;
	};
	a.appendChild(img);
	div3.appendChild(a);
	this.div2.appendChild(div3);
	
	if(this.categories) {
		var a4 = celt("A", {
			childs : [
			     celt("IMG", {
			    	 att:{
			    		 src:"img/menu.png"
			    	 }
			     })
			]
		});

		var div4 = celt("DIV", {
			styles : {
				position:"absolute",
				right : "16px",
				marginTop : "2px"
			},
			childs : [ a4 ]
		});
		
		a4.onclick = function(event) {
			event.stopPropagation();

			if(gid("dynamicFilterPopup")) {
				dynamicFilterHidePopup();
				return;
			}
			
	
			var listchilds = [];
			for(var cat in othis.categories) {
				var cb = celt("INPUT", {att:{ 
			    	id:"dynamicFilterPopup_"+cat, 
			    	type:"checkbox", 
			    	class:"dynamicFilterCheckbox", 
			    }});
				cb.checked = othis.categories[cat].value;
				cb.onclick = function(event) {
					dynamicFilterOnClick(event);
					event.stopPropagation();
				};
				
				var cbimg = celt("IMG", {
			    	att:{ 
			    		src:"img/cb-"+othis.categories[cat].value+".png", 
			    		id:"dynamicFilterCbImg_"+cat 
			    	}, 
			    	styles:{
			    		height:"14px", 
			    		marginRight:"3px"
			    	}
			    });
				cbimg.onclick = function(event) {
					event.stopPropagation();
					var mycbid = "dynamicFilterPopup_"+this.id.replace("dynamicFilterCbImg_", "");
					var mycb = gid(mycbid);
					mycb.checked = !(mycb.checked);					
					this.src = "img/cb-"+mycb.checked+".png";;
				};
				
				listchilds.push(celt("DIV", {
					childs : [
					    cbimg,
					    cb,
					    celt("LABEL", {
					    	att:{ 
					    		"for":"dynamicFilterPopup_"+cat,
					    		onclick:"event.stopPropagation();"
					    	}, 
					    	childs:[ctn(othis.categories[cat].label)]
					    }),
					    celt("BR")
					]
				}));
			}
			
			var okButton = celt("IMG", {
		    	att:{ 
		    		src:"img/ok.png"
		    	}, 
		    	styles:{height:"15px", paddingRight:"8px"}
		    });
			okButton.onclick = function(event) {
				//event.stopPropagation();
				for(var cat in othis.categories) {
					var catCb = gid("dynamicFilterPopup_"+cat);
					othis.categories[cat].value = catCb.checked;
					//alert(cat+"="+othis.categories[cat].value);
				}
				othis.onchange(othis.getValue(), othis.categories);
				//dynamicFilterHidePopup();
				return false;
			}
			
			listchilds.push(celt("DIV", {
				childs : [
				    okButton,
				    celt("IMG", {
				    	att:{ 
				    		src:"img/cancel.png",
				    		//onclick:"dynamicFilterHidePopup();return false;"
				    		onclick:"return false;"
				    	}, 
				    	styles:{height:"15px"}})
				]
			}));
			
			var dd4 = celt("DIV", {
				att : {
					id  : "dynamicFilterPopup",
					class:"dynamicFilterPopup"
				},
				styles : {
					position:"absolute",
					top : (div4.offsetTop+div4.offsetHeight)+"px",
					//right : (othis.div2.offsetWidth-div4.offsetLeft/*+div4.offsetWidth*/)+"px"
					right : "10px",
					zIndex : 100
				},
				childs : listchilds
			});
			othis.div2.appendChild(dd4);
			return false;
		};
			
		this.div2.appendChild(div4);
	}
	
	this.input.onfocus = function(event) {
		if(event.target.value == emptyMessage) {
			event.target.value = "";
			event.target.style.color = "black";
		}
	}
	this.input.onblur = function(event) {
		if(event.target.value == "") {
			event.target.value = emptyMessage;
			event.target.style.color = "grey";
		}
	}

	//div2.appendChild(this.input);
	this.div2.appendChild(this.input);
	
	this.input.onkeypress = function(event) {
		if(event.keyCode == 13) {
			// enter key : cancel current timeout and filter now
			if(othis.lastOnChangeSetTimeoutHandle != null) {
				clearTimeout(othis.lastOnChangeSetTimeoutHandle);
			}
			var ovalue = othis.getValue();
			if(ovalue != othis.lastOnChangeValue) {
				if(othis.onchange != null) {
					othis.onchange(ovalue, othis.categories);
				}
			}
			
			//othis.lastOnChangeCallDate = null;
			othis.lastOnChangeSetTimeoutHandle = null;
			othis.lastOnChangeValue = ovalue;
		}
		else if(event.charCode!=0 || event.keyCode==8 || event.keyCode==46) {
			// other key, if character : set a timeout to filter 0.5sec after
			if(othis.lastOnChangeSetTimeoutHandle == null) {
				othis.lastOnChangeSetTimeoutHandle = setTimeout(function() {
					var ovalue = othis.getValue();
					if(ovalue != othis.lastOnChangeValue) {
						if(othis.onchange != null) {
							othis.onchange(ovalue, othis.categories);
						}
						othis.lastOnChangeSetTimeoutHandle = null;
						othis.lastOnChangeValue = ovalue;
					}
				}, dynamicFilterMinIntervalMilliSec)
			}
		}
		/*else {
			alert(event.keyCode);
		}*/
	};
	
	this.emptyValue = function() {
		this.input.value = emptyMessage;
		this.input.style.color = "grey";
		if(this.onchange) {
			this.onchange(null, null);
		}
	} 
	
	this.getValue = function() {
		if(this.input.value == emptyMessage || this.input.value == "") {
			return null;
		}
		else {
			return this.input.value.trim();
		}

	}
}

function dynamicFilterOnClick(event) {
	var id = "dynamicFilterCbImg_"+event.target.id.replace("dynamicFilterPopup_", "");
//	alert(id);
	gid(id).src = "img/cb-"+event.target.checked+".png";
}

function dynamicFilterHidePopup() {
	var d = gid("dynamicFilterPopup");
	if(d) {
		d.parentElement.removeChild(d);
	}
}

//// suggestion box

function SuggestionBox(div, listName, emptyMessage) {
	var othis = this;
	this.div = div;
	this.onchange = null;
	this.clearEntries = function() {
		while(this.datalist.firstChild) {
			this.datalist.removeChild(this.datalist.firstChild);
		}
	}
	
	this.populateEntries = function(entries) {
		var arr = entries.slice(0);
		arr.sort(function (a, b) {
		    return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		
		for(var i=0; i!=arr.length; i++) {
			var text = arr[i];
			this.datalist.appendChild(celt("OPTION", {
				att: {
					value : text,
					textContent : text
				}
			}));
		}
		
	}
	
	this.setEntries = function(entries) {
		this.clearEntries();
		this.populateEntries(entries);
	}

	this.box = celt("INPUT", {
		att : {
			type:"text",
			list:listName,
			value: emptyMessage
		},
		styles : {
			color : "grey"
		}
	});
	
	this.box.onchange = function(event) {
		if(othis.onchange) {
			othis.onchange(event);
		}
	};
	
	this.datalist = gid(listName); 
	if(!this.datalist) {
		this.datalist = celt("DATALIST", {
			att : { id:listName }
		});
		this.div.appendChild(this.datalist);
	}
	this.div.appendChild(this.box);
	
	this.box.onfocus = function(event) {
		if(event.target.value == emptyMessage) {
			event.target.value = "";
			event.target.style.color = "black";
		}
	}
	this.box.onblur = function(event) {
		if(event.target.value == "") {
			event.target.value = emptyMessage;
			event.target.style.color = "grey";
		}
	}
	
	this.getValue = function() {
		if(this.box.value == emptyMessage) {
			return "";
		}
		return this.box.value;
	}

	this.setValue = function(val) {
		if(val == null || val == "") {
			this.box.value = emptyMessage;
		}
		else {
			this.box.value = val;
		}
	}

	/*var othis = this;
	this.filterOnChange = function(newValue) {
		console.log(newValue);
		if(!gid("suggestionBoxPopup")) {
			othis.divEntries = null;
			othis.divEntriesTable = null;
		}
		
		if(!othis.divEntries) {
			othis.divEntriesTable = celt("TABLE");
			othis.divEntries = celt("DIV", {
				att: { id:"suggestionBoxPopup" },
				childs : [ othis.divEntriesTable ]
			});
			othis.div.appendChild(othis.divEntries);
		}
		
		for(var i=0; i!=othis.entries.length; i++) {
			var text = othis.entries[i];
			othis.divEntriesTable.appendChild(
				celt("TR", { childs : [
				    celt("TD", {att:{textContent:text}})
				]})
			);
		}
	}

	this.div = div;
	this.entries = entries;
	this.dynamicFilter = new DynamicFilter(this.div, null, "select start table here", this.filterOnChange, null);
	this.divEntries = null;
	this.divEntriesTable = null;
	*/
	
	
}

/*function suggestionBoxHidePopup() {
	var d = gid("suggestionBoxPopup");
	if(d) {
		d.parentElement.removeChild(d);
	}
}*/

