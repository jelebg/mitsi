// everything TBD yet, but without highlight.js

/*function highlightOnKeyDown(event) {
	if(event.ctrlKey || event.altKey  || event.metaKey) {
		return;
	}
	
	console.log("char:'"+event.char+"'");
	highlight();
}
			
function highlight() {

	if(hightlightToggle==null || !hightlightToggle.value) {
		// todo : ne le faire qu'une fois
		// todo : eviter de faire du html si le texte contient des <>
		//var text = gid("sqlinput").textContent;
		//gid("sqlinput").innerHTML = "";
		return;
	}
	
	try {
		//var sel = window.getSelection();
		//console.log(sel);
		// TODO : revoir les fonctions *PositionInContentEditable pour que ça fonctionne avec du formatage
		var caret = getPositionInContentEditable(gid("sqlinput"));
		hljs.highlightBlock(gid("sqlinput"));
		setPositionInContentEditable(gid("sqlinput"), caret);
	}
	catch (e) {
		console.log("e:"+e);
		console.log("stack:"+e.stack);
	}
}*/

/*function setPositionInContentEditable2(el, pos) {
	//var el = document.getElementById("editable");
	console.log("setPositionInContentEditable pos="+pos);
	var range = document.createRange();
	var sel = window.getSelection();
	range.setStart(el.childNodes[0], pos);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
}*/



/*function setPositionInElement(range, el, pos) {
	if(el.nodeType != Node.TEXT_NODE) {
		if(el.childNodes != null) {
			for(var i=0; i!=el.childNodes.length; i++) {
				pos = setPositionInElement(range, el.childNodes[i], pos);
				if(pos <= 0) {
					return pos;
				}
			}
		}
		return pos;
	}
	
	if(el.length < pos) {
		return pos-el.length;
	}
	
	range.setStart(el, pos)
	return 0;
}

function setPositionInContentEditable(el, pos) {
	//var el = document.getElementById("editable");
	//console.log("setPositionInContentEditable pos="+pos);
	var range = document.createRange();
	var sel = window.getSelection();
	
	setPositionInElement(range, el, pos);
	
	/*range.setStart(el.childNodes[0], pos);
	// TODO : vérifier qu'on n'a 
	for(var i=0; i!=el.childNodes.length; i++) {
		var t = el.childNodes[i];
		if(t.nodeType != Node.TEXT_NODE) {
			continue;
		}
		if(pos <= t.nodeValue
	}* /
	
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
}

function getPositionInContentEditable(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
	//console.log("caretOffset="+caretOffset);
    return caretOffset;
}*/