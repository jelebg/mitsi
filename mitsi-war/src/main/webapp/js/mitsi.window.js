/* recuperer la hauteur de la fenetre */
function getWindowHW() {
	var myHeight = 0;
	if (typeof (window.innerHeight) == 'number') {
		myHeight = window.innerHeight;
	} else if (document.documentElement
			&& document.documentElement.clientHeight) {
		myHeight = document.documentElement.clientHeight;
	} else if (document.body && document.body.clientHeight) {
		myHeight = document.body.clientHeight;
	}

	var myWidth = 0;
	if (typeof (window.innerWidth) == 'number') {
		myWidth = window.innerWidth;
	} else if (document.documentElement && document.documentElement.clientWidth) {
		myWidth = document.documentElement.clientWidth;
	} else if (document.body && document.body.clientWidth) {
		myWidth = document.body.clientWidth;
	}

	return {
		h : myHeight,
		w : myWidth
	};
}

/* recupérer la position absolue d'un div */
function getAbsoluteXY(element) {
	let lx = 0;
	let ly = 0;
	for (; element != null; lx += element.offsetLeft, ly += element.offsetTop, element = element.offsetParent);
	return {
		x : lx,
		y : ly
	};
}

/* ajuste un element pour remplir la page sur toute la hauteur jusqu'en bas */
function adjustToWindow(element, windowHW, marginH, marginW) {
	var elementXY = getAbsoluteXY(element);
	element.style.height = (windowHW.h-elementXY.y-(marginH?marginH:0))+"px";
	element.style.width = (windowHW.w-elementXY.x-(marginW?marginW:0))+"px";
	//element.style.height = (windowHW.h-element.offsetTop)+"px";
	//element.style.width = (windowHW.w-element.offsetLeft)+"px";
}
function adjustToWindowH(element, windowHW) {
	var elementXY = getAbsoluteXY(element)
	element.style.height = (windowHW.h-elementXY.y)+"px";
	//element.style.height = (windowHW.h-element.offsetTop)+"px";
}
function adjustToWindowW(element, windowHW) {
	var elementXY = getAbsoluteXY(element)
	element.style.width = (windowHW.w-elementXY.x)+"px";
	//element.style.width = (windowHW.w-element.offsetLeft)+"px";
}

// positionnement relatif des éléments les uns par rapport aux autres
function adjustRelativeX(elLeft, elRight, space) {
	//var elLeftXY = getAbsoluteXY(elLeft);
	
	elRight.style.left = (elLeft.offsetLeft + elLeft.offsetWidth + space)+"px";
}
function adjustRelativeY(elUp, elDown, space) {
	//var elUpXY = getAbsoluteXY(elUp);
	
	var h = parseInt(elUp.style.height.replace("px", ""));
	elDown.style.top = (elUp.offsetTop + h + space)+"px";
}


var draggingX = false;
var pointerStartX = 0;
var separatorStartX = 0;
var draggingY = false;
var pointerStartY = 0;
var separatorStartY = 0;
var ghost = null;
var ghostParent = null;

function mouseMoveHandlerForDragging(event) {
	if(draggingX) {
		if(event.pageX < 10 || event.pageX > getWindowHW().w-10) {
			if(ghost != null) {
				ghostParent.removeChild(ghost);
			}
			
			draggingX = false;
			pointerStartX = 0;
			separatorStartX = 0;
			ghost = null;
			document.onmouseup = null;
			return false;
		}
	
	
		var dx = event.screenX - pointerStartX;
		ghost.style.left = (separatorStartX + dx)+"px";
		return false;
	}
	
	if(draggingY) {
		if(event.pageY < 10 || event.pageY > getWindowHW().h-10) {
			if(ghost != null) {
				ghostParent.removeChild(ghost);
			}
			
			draggingY = false;
			pointerStartY = 0;
			separatorStartY = 0;
			ghost = null;
			document.onmouseup = null;
			return false;
		}
	
	
		var dy = event.screenY - pointerStartY;
		ghost.style.top = (separatorStartY + dy)+"px";
		return false;
	}
} 

// separateur vertical entre deux div
function vSeparatorFor(separator, lefts, rights)  {
	
	separator.style.cursor = "ew-resize";
	
	document.onmousemove = mouseMoveHandlerForDragging;

	separator.onmousedown = function(event) {
		draggingX = true;
		pointerStartX = event.screenX;
		separatorStartX = separator.offsetLeft;
		
		ghost = document.createElement("DIV");
		ghost.style.width = "5px";
		ghost.style.height = separator.style.height;
		ghost.style.position = "absolute";
		const separatorXY = getAbsoluteXY(separator);
		ghost.style.top = separatorXY.y;
		ghost.style.left = (separatorStartX)+"px";
		ghost.style.backgroundColor = "black";
		ghost.style.opacity = "0.4";
		ghost.style.zIndex = "100";
		ghostParent = separator.offsetParent;
		ghostParent.appendChild(ghost);

		document.onmouseup = function(event) { // NOSONAR complexity is OK
			if(draggingX) {
				const dx = event.screenX - pointerStartX;
				separator.style.left = (separatorStartX + dx)+"px";
				if(lefts) {
					for(let i=0; i!=lefts.length; i++) {
						const left = lefts[i];
						left.style.width = (left.offsetWidth + dx)+"px";
					}
				}
				if(rights) {
					for(let i=0; i!=rights.length; i++) {
						const right = rights[i];
						right.style.width = (right.offsetWidth - dx)+"px";
						if(i==0) { // NOSONAR complexity is OK
							right.style.left = (right.offsetLeft + dx)+"px";
						}
					}
				}
				
				if(ghost != null) {
					separator.offsetParent.removeChild(ghost);
				}
				
				draggingX = false;
				pointerStartX = 0;
				separatorStartX = 0;
				ghost = null;
				document.onmouseup = null;
				return false;
			}
		}
		
		return false;
	}


}

// separateur vertical entre deux div
function hSeparatorFor(separator, ups, downs)  {
	
	separator.style.cursor = "ns-resize";
	
	document.onmousemove = mouseMoveHandlerForDragging;
	
	separator.onmousedown = function(event) {
		draggingY = true;
		pointerStartY = event.screenY;
		separatorStartY = separator.offsetTop;
		
		ghost = document.createElement("DIV");
		ghost.style.width = separator.style.width;
		ghost.style.height = "5px";
		ghost.style.position = "absolute";
		var separatorXY = getAbsoluteXY(separator);
		ghost.style.top = (separatorStartY)+"px";
		ghost.style.left = separatorXY.x;
		ghost.style.backgroundColor = "black";
		ghost.style.opacity = "0.4";
		ghost.style.zIndex = "100";
		ghostParent = separator.offsetParent;
		ghostParent.appendChild(ghost);

		document.onmouseup = function(event) { // NOSONAR complexity is OK
			if(draggingY) {
				const dy = event.screenY - pointerStartY;
				separator.style.top = (separatorStartY + dy)+"px";
				if(ups) {
					for(let i=0; i!=ups.length; i++) {
						const up = ups[i];
						up.style.height = (up.offsetHeight + dy)+"px";
					}
				}
				if(downs) {
					for(let i=0; i!=downs.length; i++) {
						const down = downs[i];
						down.style.height = (down.offsetHeight - dy)+"px";
						if(i==0) { // NOSONAR complexity is OK
							down.style.top = (down.offsetTop + dy)+"px";
						}
					}
				}
				
				if(ghost != null) {
					separator.offsetParent.removeChild(ghost);
				}
				
				draggingY = false;
				pointerStartY = 0;
				separatorStartY = 0;
				ghost = null;
				document.onmouseup = null;
				return false;
			}
		}
	
		return false;
	}


}
