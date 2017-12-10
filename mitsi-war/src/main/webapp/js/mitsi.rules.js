
// functions for mitsi rules

// TODO : faire une gestion des dependances pour "LABELLED" : si une rule utilise LABELLED, le label indiqué doit etre compute avant + erreur si dependence circulaire
function ruleCompute(rule, variables, labels) {
	if(rule.literal || rule.name) {
		throw new Error("cannot evaluate literal or expression outside of expression");
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
			throw new Error("right-hand side of LIKE is not a litteral");
		}
		if(!rule.left.name) {
			throw new Error("left-hand side of LIKE is not a variable name");
		}
		lhsValue = getVariableValue(rule.left.value, variables, false, false);
		if(!lhsValue) {
			throw new Error(rule.left.value+" is undefined");
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
			variables.customVariables[rule.storeResultInVariable] = tostore;
		}
		
		return regexExec != null;
	}
	else if(rule.operator == "IN") {
		if(!rule.right.name) {
			throw new Error("right-hand side of IN is not a collection name");
		}
		let collection = getVariableValue(rule.right.value, variables, false, true);
		if (!collection) {
			throw new Error("collection "+rule.right.value+" does not exist");
		}
		let lhsValues = null;
		if(rule.left.name) {
    		lhsValues = getVariableValue(rule.left.value, variables, true, false);
			if(!lhsValues) {
				throw new Error(rule.left.value+" is undefined");
			}
		}
		else if(rule.left.literal) {
			lhsValues = [ rule.left.value ];
		}
		else {
			throw new Error("unknown lhs type");
		}
		let ret = [];
		for (let iLhsValue = 0; iLhsValue != lhsValues.length; iLhsValue ++) {
		    let lhsValue = lhsValues[iLhsValue]
		    let v = collection[lhsValue];
		    if (v) {
		        ret = ret.concat(v);
		    }
		}
		if (rule.storeResultInVariable) {
			variables.customArrays[rule.storeResultInVariable] = ret;
		} 
		return ret.length > 0;
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
		throw new Error("right-hand side of == or != is not a litteral or a variable name");
	}
	if(!rule.left.literal && !rule.left.name) {
		throw new Error("left-hand side of == or != is not a litteral or a variable name");
	}
	
	let lhsValue = null;
	if(rule.left.name) {
		let lhsValues = getVariableValue(rule.left.value, variables, true, false);
		if(!lhsValues || lhsValues.length == 0) {
			throw new Error(rule.left.value+" is undefined");
		}

		lhsValue = lhsValues[0]
		for (let i=1; i<lhsValues.length; i++) {
		    if (lhsValue !== lhsValues[i]) {
		        throw new Error("different values are found for left value in == or != test "+rule.left.value);
		    }
		}
	}
	else {
		lhsValue = rule.left.value;
	}
	
	let rhsValue = null;
	if(rule.right.name) {
		rhsValues = getVariableValue(rule.right.value, variables, true, false);;
		if(!rhsValues || rhsValues.length == 0) {
			throw new Error(rule.right.value+" is undefined");
		}

		rhsValue = rhsValues[0]
		for (let i=1; i<rhsValues.length; i++) {
		    if (rhsValue !== rhsValues[i]) {
		        throw new Error("different values are found for right value in == or != test "+rule.right.value);
		    }
		}
    }
	else {
		rhsValue = rule.right.value;
	}

    if (typeof(lhsValue) != "string") {
        lhsValue = lhsValue.toString()
    }
    if (typeof(rhsValue) != "string") {
        rhsValue = rhsValue.toString();
    }
	return lhsValue.toUpperCase() == rhsValue.toUpperCase();
}

function getVariableValueInAllNameTrees(nameParts, treeList) {
    let values = null;

    for (let i=0; i!=treeList.length; i++) {
        let v = getVariableValueInNameTree(nameParts, treeList[i]);
        if (v) {
            if (values == null) {
                values = [ v ];
            }
            else {
                values = values.push(v);
            }
        }
    }
    return values;
}

function getVariableValueInNameTree(nameParts, tree) {
    let varPart = tree[nameParts[0]];

    if (!varPart) {
        return null;
    }

    for (let i=1; i<nameParts.length; i++) {
        let namePart = nameParts[i];
        varPart = varPart[namePart];
        if (!varPart) {
            return null;
            //break;
        }
	}

	return varPart;
}

function getVariableValue(name, variables, asArray, asCollection) {
	let nameParts = name.split(".");

	// TODO : mutualiser les trois premiers cas

	// test if it is a variable
	let varInVariables = getVariableValueInNameTree(nameParts, variables.variables);
    if (varInVariables) {
        if (asCollection) {
            return null;
        }
        if (asArray) {
            return [varInVariables];
        }
        return varInVariables;
    }

	// test if it is a collection
	let varInCollections = getVariableValueInNameTree(nameParts, variables.collections);
    if (varInCollections) {
        if (asCollection) {
            return varInCollections;
        }
        return null;
    }

	// test if it is a custom variable
    let varInCustomVariables = getVariableValueInNameTree(nameParts, variables.customVariables);
    if (varInCustomVariables) {
        if (asCollection) {
		        return null;
        }
        if (asArray) {
            return [varInCustomVariables];
        }
        return varPart;
    }

	// test if it is a custom array.
	let customarraySubTreeList = variables.customArrays[nameParts[0]];
	if (customarraySubTreeList) {
        let customCollection = getVariableValueInAllNameTrees(nameParts.slice(1), customarraySubTreeList);
        if (customCollection) {
            if (asCollection) {
                return null;
            }
            if (asArray) {
                return customCollection;
            }
            return customCollection.join(",");
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
			currents = getVariableValue(expression.expr.value, variables, true, false);
			if (!currents) {
				return null;
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
			currentCollections = getVariableValue(collection.value, variables, true, false);
			// TODO : test if currentCollections are really collections
			if (!currentCollections) {
				return null;
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


