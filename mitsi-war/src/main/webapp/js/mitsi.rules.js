
// functions for mitsi rules

// TODO : faire une gestion des dependances pour "LABELLED" : si une rule utilise LABELLED, le label indiqué doit etre compute avant + erreur si dependence circulaire
function ruleCompute(rule, variables, labels) {
	if(rule.literal || rule.name) {
		throw "cannot evaluate literal or expression outside of expression";
	}
	
	if(rule.operator == "LABELLED") {
	    for (let labelsType in labels) {
		    if (!labels.hasOwnProperty(labelsType) ) {
		    	continue;
		    }
		    
		    if (labels[labelsType].indexOf(rule.label)>=0) {
		    	return true;
		    }
		}              
		
		return false;
	}
	else if(rule.operator == "NOT") {
		return ! ruleCompute(rule.expression, variables, labels);
	}
	else if(rule.operator == "AND") {
		let leftResult = ruleCompute(rule.left, variables, labels);
		if(leftResult == false) {
			return leftResult;
		}
		let rightResult = ruleCompute(rule.right, variables, labels);
		return leftResult && rightResult;
	}
	else if(rule.operator == "OR") {
		let leftResult = ruleCompute(rule.left, variables, labels);
		// don't eval the right hand side if not necessary
		if(leftResult == true) {
			return leftResult;
		}
		let rightResult = ruleCompute(rule.right, variables, labels);
		return leftResult || rightResult;
	}
	else if(rule.operator == "LIKE") {
		if(!rule.right.literal) {
			throw "right-hand side of LIKE is not a litteral"; 
		}
		if(!rule.left.name) {
			throw "left-hand side of LIKE is not a variable name"; 
		}
		lhsValue = getVariableValue(rule.left.value, variables);
		if(!lhsValue) {
			throw rule.left.value+" is undefined"; 
		}
		let regex = rule.regex;
		if(!regex) {
			regex = new RegExp(rule.right.value);
			rule.regex = regex;
		}
		
		let regexExec = regex.exec(lhsValue);
		
		if (rule.storeResultInVariable) {
			let tostore = null;
			if (regexExec!=null) {
				// TODO : eviter d'écraser les variables built-in mitsi
				// TODO : marquer la variable comme custom pour pouvoir l'écraser ensuite
				tostore = {};
				for (let i=0; i!=regexExec.length; i++) {
					tostore["group"+i] = regexExec[i];
				}
			}				
			variables[rule.storeResultInVariable] = tostore;
		}
		
		return regexExec != null;
	}
	else if(rule.operator == "IN") {
		if(!rule.right.name) {
			throw "right-hand side of IN is not a collection name"; 
		}
		let collection = getVariableValue(rule.right.value, variables);
		if (!collection) {
			throw "collection "+rule.right.value+" does not exist"; 
		}
		// TODO : test if collection is really a collection
		let lhsValue = null;
		if(rule.left.name) {
			lhsValue = getVariableValue(rule.left.value, variables);
			if(!lhsValue) {
				throw rule.left.value+" is undefined"; 
			}
		}
		else if(rule.left.literal) {
			lhsValue = rule.left.value;
		}
		else {
			throw "unknown lhs type";
		}
		let ret = collection[lhsValue];
		if (rule.storeResultInVariable) {
			// TODO : eviter d'écraser les variables built-in mitsi
			// TODO : marquer la variable comme custom pour pouvoir l'écraser ensuite
			variables[rule.storeResultInVariable] = ret ? ret : null;
		} 
		return ret != null;
	}
	else if(rule.operator == "==") {
		return ruleComputeEquality(rule, variables, labels);
	}
	else if(rule.operator == "!=") {
		return !ruleComputeEquality(rule, variables, labels);
	}
	
}

function ruleComputeEquality(rule, variables, labels) {
	if(!rule.right.literal && !rule.right.name) {
		throw "right-hand side of LIKE is not a litteral or a variable name"; 
	}
	if(!rule.left.literal && !rule.left.name) {
		throw "left-hand side of LIKE is not a litteral or a variable name"; 
	}
	
	let lhsValue = null;
	if(rule.left.name) {
		lhsValue = getVariableValue(rule.left.value, variables);
		if(!lhsValue) {
			throw rule.left.value+" is undefined"; 
		}
	}
	else {
		lhsValue = rule.left.value;
	}
	
	let rhsValue = null;
	if(rule.right.name) {
		rhsValue = variables[rule.right.value];
		if(!rhsValue) {
			throw rule.right.value+" is undefined"; 
		}
	}
	else {
		rhsValue = rule.right.value;
	}

	return lhsValue.toUpperCase() == rhsValue.toUpperCase();
}

function getVariableValue(name, variables) {
	let nameParts = name.split(".");
	
	// test if it is a variable
	let varPart = variables[nameParts[0]];
	if (varPart) {
		for (let i=1; i<nameParts.length; i++) {
			let namePart = nameParts[i];
			varPart = varPart[namePart];
			if (!varPart) {
				break;
			}		
		}
		if (varPart) {
			return varPart;
		}
	}
	
	return null;

}

// functions to handle strings containing variables with ${} 

function getVariableStringParts(varPegjs, str) {
	let parts = [];
	
	let regex = /\$\{[ \t]*(.*?)[ \t]*\}/g;
	
	while(true) {
		let previousLastIndex = regex.lastIndex;
		let regexResult = regex.exec(str);
		if(regexResult == null) {
			parts.push({ "fixed":str.substring(previousLastIndex), "variable":null});
			break;
		}
		parts.push({ 
			"fixed":str.substring(previousLastIndex, regexResult.index), 
			"variable":varPegjs.parse(regexResult[1])
		});
	}
	
	return parts;
}

/*
 * expression : { expr, next }
 * variableContext : { variables, customVariables, collections }
 * parents : []
 */
function computeVariableStringPartVariable(expression, variables, parents) {
	// TODO : arrays a tester (par exemple si on a deux indexs sur une même colonne)
	
	let next = expression.next;
	let currents = [];

	if (name.literal) {
		if (parents != null || next != null) {
			// on ne peut pas utiliser un literal dans une expression du type truc."literal".machin
			return null;
		}
		return parents;
	}
	
	if (expression.expr.name) {
		// TODO : tester les undefined etc. et renvoyer null si on ne trouve rien
		
		if (parents == null) { 
			currents = getVariableValue(expression.expr.value, variables);
			if (!currents) {
				return null;
			}
			if (!Array.isArray(currents)) {
				currents = [ currents ];
			}
		}
		else {
			// TODO : mettre un maximum pour le nombre de résultats renvoyés, de toute façon on ne peut pas en afficher trop ...
			for (let i=0; i!=parents.length; i++) {
				let parent = parents[i];
				currents.push(parent[expression.expr.value]);
			}
		}
		
	}
	else if (expression.expr.collection) {
		let currentCollections = null;
		if (parents == null) { 
			let collection = expression.expr.collection;
			if (!collection.name) {
				// collection name has to be a name and nothing else
				return null;
			}
			currentCollections = getVariableValue(collection.value, variables);
			// TODO : test if currentCollections are really collections
			if (!currentCollections) {
				return null;
			}
			if (!Array.isArray(currentCollections)) {
				currentCollections = [ currentCollections ];
			}
		}
		else {
			currentCollections = [];
			// TODO : mettre un maximum pour le nombre de résultats renvoyés, de toute façon on ne peut pas en afficher trop ...
			for (let i=0; i!=parents.length; i++) {
				let parent = parents[i];
				let collection = parent[expression.expr.collection.value];
				if (collection) {
					currentCollections.push(collection);
				}
			}
		}
		
		// TODO : mettre un maximum pour le nombre de résultats renvoyés, de toute façon on ne peut pas en afficher trop ...
		for (let i=0; i!=currentCollections.length; i++) {
			let currentCollection = currentCollections[i];
			
			let indexValue = computeVariableStringPartVariable(expression.expr.index, variables, null);
			if (!indexValue) {
				continue;
			}
			let found = currentCollection[indexValue];
			if (found) {
				currents = currents.concat(found);
			}
		}
	}
	
	if (currents.length == 0) {
		return null;
	}
	if(next) {
		return computeVariableStringPartVariable(next, variables, currents);
	}
	return currents;

	
}

function computeVariableString(parts, variables) {
	let str = "";
	
	for(let i=0; i<parts.length; i++) {
		let part = parts[i];
		if(part.fixed) {
			str += part.fixed;
		}
		if(part.variable) {
			let o = computeVariableStringPartVariable(part.variable, variables, null);
			str += getStringFromObject(o, false);
		}
	}
	
	return str;
}

function getStringFromObject(obj, stringifyArrays) {
	if (obj == null) {
		return "";
	}
	
	if(!stringifyArrays && Array.isArray(obj)) {
		let str = getStringFromObject(obj[0], true);
		for (let i=1; i<obj.length; i++) {
			str += ", " + getStringFromObject(obj[i], true);
		}
		return str;
	}
	else if(typeof obj === 'string') {
		return obj;
	}
	else {
		return JSON.stringify(obj, null, 2);
	}
}


