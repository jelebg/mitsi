
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
	    // TODO : right hand side of a like must be a litteral, but cannot be evaluated because $ and { are used by regex and expression. maybe it could be possible to find a solution, because $ can only be at the end of a regex ... but would it be usefull ?
		if(!rule.right.literal) {
			throw new Error("right-hand side of LIKE is not a litteral");
		}
		if(!rule.left.name) {
			throw new Error("left-hand side of LIKE is not a variable name");
		}
		lhsValues = getVariableValue(rule.left.value, variables, true, false);
		if(!lhsValues || lhsValues.length == 0) {
			throw new Error(rule.left.value+" is undefined");
		}
		let regex = rule.regex;
		if(!regex) {
			regex = new RegExp(rule.right.value);
			rule.regex = regex;
		}

        // if many variables are found, return true only if every on matches the regex
		let maxGroups = 0;
		let regexExecList = [];
		for (let i=0; i!=lhsValues.length; i++) {
            let regexExec = regex.exec(lhsValues[i]);
            if (! regexExec) {
                return false;
            }
            if (maxGroups < regexExec.length) {
                maxGroups = regexExec.length;
            }
            regexExecList.push(regexExec);
        }

        if (rule.storeResultInVariable) {
            // if many variables are found, and all matches,
            // and we want to store the matching groups, concatenates the groups,
            // then we concatenate the groups with ','
            // TODO : fair des tableaux plutôt ? ça va devenir compliqué, est-ce bien nécessaire ?
            let tostore = {};
    		for (let i=0; i!=regexExecList.length; i++) {
                let regexExec = regexExecList[i];
                for (let j=0; j!=maxGroups; j++) {
                    let group = (j>=regexExec.length ? "" : regexExec[j]);
                    tostore["group"+j] = (i==0 ? group : tostore["group"+i]+","+group);
                }
            }
            variables.customVariables[rule.storeResultInVariable] = tostore;
        }
		
		return true;
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
		    if (!rule.left.literalNameParts) {
		        rule.left.literalNameParts = getVariableStringParts(pegVariables, rule.left.value);
		    }
			lhsValues = computeVariableString(rule.left.literalNameParts, variables, true);
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
        lhsValue = lhsValue.toString();
    }
    if (typeof(rhsValue) != "string") {
        rhsValue = rhsValue.toString();
    }
	return lhsValue.toUpperCase() == rhsValue.toUpperCase();
}

function getVariableValueInAllNameTrees(nameParts, treeList) {
    if (!nameParts || nameParts.length == 0) {
        return treeList;
    }

    let values = null;

    for (let i=0; i!=treeList.length; i++) {
        let v = getVariableValueInNameTree(nameParts, treeList[i]);
        if (v) {
            if (values == null) {
                values = [ v ];
            }
            else {
                values.push(v);
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
        if (asArray) {
            return [ varInCollections ];
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

	if (expression.expr.literal) {
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
		
		let indexValue = computeVariableStringPartVariable(expression.expr.index, variables, null);
		if (indexValue) {
    		// TODO : mettre un maximum pour le nombre de résultats renvoyés, de toute façon on ne peut pas en afficher trop ...
	    	for (let i=0; i!=currentCollections.length; i++) {
		    	let currentCollection = currentCollections[i];

			    let found = currentCollection[indexValue];
			    if (found) {
				    currents = currents.concat(found);
			    }
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

function computeVariableString(parts, variables, returnAsArray) {
    // TODO : supprimer le paramètre returnAsArray quand il ne sera plus utilisé, et quand on saura traiter les array correctement ici (cf test eyeshine.variableStringCompute.test.js->it("use computeVariableString to return an array of 2 element"))
    if (returnAsArray) {
        let t = [];

        for (let i=0; i<parts.length; i++) {
            let part = parts[i];

            if (part.fixed) {
                if (t.length == 0) {
                    t = [ part.fixed ];
                }
                else {
                    for (j=0; j!=t.length; j++) {
                        t[j] += part.fixed;
                    }
                }
            }
            if (part.variable) {
                let o = computeVariableStringPartVariable(part.variable, variables, null);
                let toadd = getStringArrayFromObject(o);
                if (t.length == 0) {
                    t = toadd;
                }
                else {
                    let newt = [];
                    for (j=0; j!=t.length; j++) {
                        for (k=0; k!=toadd.length; k++) {
                            newt.push(t[j]+toadd[k]);
                        }
                    }
                    t = newt;
                }
            }
        }

        return t;
    }
    else {
    // TODO : supprimer ce code quand il ne sera plus utilisé, cf commentaire plus haut
        let str = "";

        for (let i=0; i<parts.length; i++) {
            let part = parts[i];
            if (part.fixed) {
                str += part.fixed;
            }
            if (part.variable) {
                let o = computeVariableStringPartVariable(part.variable, variables, null);
                str += getStringFromObject(o, false);
            }
        }

        return str;
    }
}

function getStringArrayFromObject(obj) {
	if (obj == null) {
		return [];
	}

	if(Array.isArray(obj)) {
		return obj;
	}
	if(typeof obj === 'string') {
		return [ obj ];
	}

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


