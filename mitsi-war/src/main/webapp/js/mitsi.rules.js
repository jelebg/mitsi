
// functions for mitsi rules

function ruleCompute(rule, variables, collections, labels) {
	if(rule.literal || rule.name) {
		throw "cannot evaluate literal or expression outside of expression";
	}
	
	if(rule.operator == "LABELLED") {
		return labels.indexOf(rule.label)>=0;
	}
	if(rule.operator == "NOT") {
		return ! ruleCompute(rule.expression, variables, collections, labels);
	}
	else if(rule.operator == "AND") {
		let leftResult = ruleCompute(rule.left, variables, collections, labels);
		if(leftResult == false) {
			return leftResult;
		}
		let rightResult = ruleCompute(rule.right, variables, collections, labels);
		return leftResult && rightResult;
	}
	else if(rule.operator == "OR") {
		let leftResult = ruleCompute(rule.left, variables, collections, labels);
		// don't eval the right hand side if not necessary
		if(leftResult == true) {
			return leftResult;
		}
		let rightResult = ruleCompute(rule.right, variables, collections, labels);
		return leftResult || rightResult;
	}
	else if(rule.operator == "LIKE") {
		if(!rule.right.literal) {
			throw "right-hand side of LIKE is not a litteral"; 
		}
		if(!rule.left.name) {
			throw "left-hand side of LIKE is not a variable name"; 
		}
		lhsValue = variables[rule.left.value];
		if(!lhsValue) {
			throw rule.left.value+" is undefined"; 
		}
		let regex = rule.regex;
		if(!regex) {
			regex = new RegExp(rule.right.value);
			rule.regex = regex;
		}
		
		return regex.test(lhsValue);
	}
	else if(rule.operator == "IN") {
		if(!rule.right.name) {
			throw "right-hand side of IN is not a collection name"; 
		}
		let collection = collections[rule.right.value];
		if(!collection) {
			throw "collection "+rule.right.value+" does not exist"; 
		}
		let lhsValue = null;
		if(rule.left.name) {
			lhsValue = variables[rule.left.value];
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
		return collection[lhsValue] != null;
	}
	else if(rule.operator == "==") {
		return ruleComputeEquality(rule, variables, collections, labels);
	}
	else if(rule.operator == "!=") {
		return !ruleComputeEquality(rule, variables, collections, labels);
	}
	
}

function ruleComputeEquality(rule, variables, collections, labels) {
	if(!rule.right.literal && !rule.right.name) {
		throw "right-hand side of LIKE is not a litteral or a variable name"; 
	}
	if(!rule.left.literal && !rule.left.name) {
		throw "left-hand side of LIKE is not a litteral or a variable name"; 
	}
	
	let lhsValue = null;
	if(rule.left.name) {
		lhsValue = variables[rule.left.value];
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

// functions to handle strings containing variables with ${} 

function getVariableStringParts(str) {
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
			"variable":getVariableStringPartsVariable(regexResult[1])
		});
	}
	
	return parts;
}

function getVariableStringPartsVariable(str) {
	let regex = /^([a-zA-Z\._]+)[ \t]*\[[ \t]*([a-zA-Z\._]+)[ \t]*\](\.[ \ta-zA-Z\._]+)?$/g;
	let regexResult = regex.exec(str);
	if(regexResult == null) {
		return { "variable":str };
	}
	let propertiesName = null;
	if(regexResult[3]) {
		propertiesName = regexResult[3].substring(1).split(/\s*\.\s*/);
	}

	return { "collection":regexResult[1], "reference":regexResult[2], "propertiesName":propertiesName };
}

function computeVariableString(parts, variables, collections) {
	let str = "";
	
	for(let i=0; i<parts.length; i++) {
		let part = parts[i];
		if(part.fixed) {
			str += part.fixed;
		}
		if(part.variable) {
			if(part.variable.variables) {
				str += variables[part.variable];
			}
			else if(part.variable.collection && part.variable.reference) {
				let reference = variables[part.variable.reference];
				let collection = collections[part.variable.collection];
				if(reference && collection) {
					let collectionValues = [];
					let array = collection[reference];
					for(let j=0; j!=array.length; j++) {
						let obj = getProperty(array[j], part.variable.propertiesName);
						if(typeof obj === 'string') {
							collectionValues.push(obj);
						}
						else {
							collectionValues.push(JSON.stringify(obj, null, 2));
						}
					}
					str += collectionValues.join(",");
				}
			} 
		}
	}
	
	return str;
}

function getProperty(obj, propertiesName) {
	if(!propertiesName) {
		return obj;
	}
	for(let i=0; i!=propertiesName.length; i++) {
		obj = obj[propertiesName[i]];
		if(!obj) {
			return null;
		}
	}
	return obj;
}

