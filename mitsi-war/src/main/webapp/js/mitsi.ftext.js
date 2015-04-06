function getContentEditableText(elt) {
	var str = "";

	if(elt.nodeType == Node.TEXT_NODE) {
		str = str + elt.textContent;
	}
	else if(elt.nodeType == Node.ELEMENT_NODE) {
		if(elt.nodeName == "BR") {
			str = str + "\n";
		}
		else {
			if(elt.childNodes) {
				for(var i=0; i!=elt.childNodes.length; i++) {
					str = str + getContentEditableText(elt.childNodes[i]);
				}
			}
		}
	}
	
	return str;
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
}

function getSqlInputOne() {
	var sqlInput = getContentEditableText(gid("sqlinput"));
	console.log("sqlInput:"+sqlInput);
	var charPos = getPositionInContentEditable(gid("sqlinput"));
	
	var regex = /[;'"]/g;
	var match = null;
	var beginIndex = 1;
	var endIndex = -1;
	var insideSingleQuotedString = false;
	var insideDoubleQuotedString = false;
	while((match=regex.exec(sqlInput)) !== null) {
		console.log("match:"+match[0]+" index:"+match.index);		
		var c = match[0];
		var index = match.index;
		if(c == ";") {
			if(!insideSingleQuotedString && !insideDoubleQuotedString) {
				if(index <= charPos) {
					beginIndex = index+1;
				}
				else {
					endIndex = index;
					break;
				}
			}
		}
		else if(c == "'") {
			if(!insideDoubleQuotedString) {
				insideSingleQuotedString = !insideSingleQuotedString;
			}
		}
		else if(c == '"') {
			if(!insideSingleQuotedString) {
				insideDoubleQuotedString = !insideDoubleQuotedString;
			}
		}
	}
	console.log("end matching");
	
	if(endIndex < 0) {
		return sqlInput.substring(beginIndex);
	}
	return sqlInput.substring(beginIndex, endIndex);;
}


function getFTextNbLigneRecurse(div) {
	var nbLines = 0;
	
	for(var i=0; i!=div.childNodes.length; i++) {
		var c = div.childNodes[i];
		if(c.nodeName=="BR") {
			nbLines++;
		}
		else {
			nbLines = nbLines + getFTextNbLigneRecurse(c);
		}
	}
	return nbLines;
}

function FText(divText, divNbLines) {
	this.getNbLines = function() {
		return getFTextNbLigneRecurse(this.divText);
	}
	this.initLineNumbers = function() {
		if(!divNbLines) {
			return;
		}
		
		divNbLines.innerHTML = "";
		for(var i=0; i!=this.nbLines+1; i++) {
			divNbLines.appendChild(document.createTextNode(""+(i+1)));
			if(i!=this.nbLines) {
				divNbLines.appendChild(document.createElement("BR"));
			}
		}
	}
	this.updateLineNumbers = function() {
		var oldNbLines = this.nbLines;
		this.nbLines = this.getNbLines();
		this.initLineNumbers();
	
	}
	
	this.divText = divText;
	this.divNbLines = divNbLines;
	this.nbLines = this.getNbLines()+1;
	this.initLineNumbers();
	
	
}
