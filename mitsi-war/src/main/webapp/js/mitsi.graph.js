function MitsiGraph() {
	this.nameTable = {};	
	this.vertexes = []; // BTW, should be vertices not vertexes
	
	this.createVertexIfNecessary = function(name) {
		var pos = this.nameTable[name];
		if(pos === undefined) {
			pos = this.vertexes.length;
			this.nameTable[name] = pos;
			this.vertexes[pos] = { 
				"name"  : name,
				"links" : [],
				"reverseLinks" : []
			};
		}
	}
	
	this.initWithDatabaseObjects = function(databaseObjects) { // NOSONAR indeed this function is too complex but it is OK 
		// create vertices
		for(let i=0; i!=databaseObjects.length; i++) {
			const dobj = databaseObjects[i];
			
			// pour les diffs, on peut avoir des types mixtes, on ne peut pas restreindre les objets ici ...
			// if(dobj.id.type != "table" && dobj.id.type != "matview"  && dobj.id.type != "view") {
			//   continue;
			// }
			
			this.createVertexIfNecessary(dobj.id.schema+"."+dobj.id.name);

		}
		
		// create links
		for(let i=0; i!=databaseObjects.length; i++) {
			const dobj = databaseObjects[i];
			
			if(dobj.id.type != "table" && dobj.id.type != "matview") {
				continue;
			}
			
			// iterate constraints to find true forign keys
			const pos = this.nameTable[dobj.id.schema+"."+dobj.id.name];
			const v = this.vertexes[pos];
			this.createLinksForFks(dobj, v, pos);
			
			// iterate columns to find candidate foreign keys
			for (let k=0; k!=dobj.columns.length; k++) {
				let column = dobj.columns[k];
				this.createLinksForCandidateFks(dobj, column);
			}
		}
	}
	
	this.createLinksForFks = function(dobj, v, pos) {
		for(let k=0; k!=dobj.constraints.length; k++) {
			const constraint = dobj.constraints[k];
			
			if(constraint.type != 'R') {
				continue;
			}
			
			const rpos = this.nameTable[constraint.fkConstraintOwner+"."+constraint.fkTable];
			const rv = this.vertexes[rpos];
			let linkAlreadyExists = false;
			let l = null;
			for(let j=0; j!=v.links.length; j++) {
				l = v.links[j];
				if(l.target == rpos) { // NOSONAR complexity is OK
					linkAlreadyExists = true;
					break;
				}
			}
			
			if(linkAlreadyExists) {
				// if a link already exists in the same direction between the 2 tables, 
				// do not create a new link but put new properties in existing link and reverse link
				if(l) { // NOSONAR complexity is OK
					l.properties.keyColumns  +=  "\n"+constraint.columns;
					l.properties.rKeyColumns +=  "\n"+constraint.fkColumns;
				}
				
				for(let j=0; j!=rv.reverseLinks.length; j++) { // NOSONAR complexity is OK
					l = rv.reverseLinks[j];
					if(l.target == rpos) {
						break;
					}
				}
				
				l.properties.keyColumns  +=  "\n"+constraint.columns;
				l.properties.rKeyColumns +=  "\n"+constraint.fkColumns;
				
			}
			else {
				// if no link exists in the same direction between the 2 tables, create a new link 
				const newLink = {
					"target"     : rpos,
					"targetName" : constraint.fkConstraintOwner+"."+constraint.fkTable,
					"properties" : {
						"keyColumns"  : constraint.columns,
						"rKeyColumns" : constraint.fkColumns
					}
				};
				
				v.links.push(newLink);
				
				const newReverseLink = {
					"target"     : pos,
					// TODO : BUG ? : ne devrait pas plutot etre la table dobj.id.schema+dobj.id.name ??? bon je corrige
					"targetName" : dobj.id.schema+"."+dobj.id.name, //constraint.fkConstraintOwner+"."+constraint.fkTable,
					"properties" : {
						"keyColumns"  : constraint.columns,
						"rKeyColumns" : constraint.fkColumns
					}
				};
				
				rv.reverseLinks.push(newReverseLink);
			}
		}
	}
	
	// candidateFk.targetTableName
	// candidateFk.comment
	this.createLinksForCandidateFks = function(dobj, column) {
		if (!column.labelsContext || !column.labelsContext.candidateFks) {
			return;
		}
		
		let candidateFks = column.labelsContext.candidateFks;
		for (let i=0; i!=candidateFks.length; i++) {
			let candidateFk = candidateFks[i];
			
			let fromIndex = this.getIndex(dobj.id.schema, dobj.id.name);
			if (fromIndex == null) {
				continue;
			}
			let from = this.getVertex(fromIndex);
			
			let toIndex = this.getIndex(candidateFk.targetTableName);
			if (toIndex == null) {
				continue;
			}
			let to = this.getVertex(toIndex);

			let existingLinks = this.getLinks(fromIndex);
			let linkAlreadyExists = false
			for (let j = 0; j < existingLinks.length; j++) {
				if (toIndex == existingLinks.target) {
					linkAlreadyExists = true;
					break;
				}
			}
			if (linkAlreadyExists) {
				continue;
			}

			// if no link exists in the same direction between the 2 tables, create a new link 
			const newLink = {
				"target"     : toIndex,
				"targetName" : to.name,
				"properties" : {
					"keyColumns"         : column.name,
					"candidateFk"        : true,
					"candidateFkComment" : candidateFk.comment,
					"doNotUseForPath"    : true
				}
			};
			from.links.push(newLink);
					
			const newReverseLink = {
				"target"     : fromIndex,
				"targetName" : from.name,
				"properties" : {
					"keyColumns"         : column.name,
					"candidateFk"        : true,
					"candidateFkComment" : candidateFk.comment,
					"doNotUseForPath"    : true
				}
			};
			to.reverseLinks.push(newReverseLink);
		}

	}

	this.getLinksByName = function(tableOwner, tableName) {
		const pos = this.nameTable[tableOwner+(tableName?"."+tableName:"")];
		if(pos == undefined) {
			return null;
		}
		return this.vertexes[pos].links;
	}
	
	this.getLinks= function(index) {
		return this.vertexes[index].links;
	}
	
	this.getReverseLinksByName = function(tableOwner, tableName) {
		const pos = this.nameTable[tableOwner+(tableName?"."+tableName:"")];
		if(pos == undefined) {
			return null;
		}
		return this.vertexes[pos].reverseLinks;
	}
	
	this.getReverseLinks= function(index) {
		return this.vertexes[index].reverseLinks;
	}

	this.getIndex = function(tableOwner, tableName) {
		return this.nameTable[tableOwner+(tableName?"."+tableName:"")];
	}
	
	this.getVertexName = function(index) {
		return this.vertexes[index].name;
	}
	this.getVertex = function(index) {
		return this.vertexes[index];
	}
	
	this.getProximityGraph = function(index, depth) { // NOSONAR complexity is OK
		let toexplore = [ index ];
		const explored = [];
		const before = [];
		const after = [];
		
		for(let i=0; i!=depth; i++) {
			const newBefore = [];
			const newAfter = [];
			const toexplorenext = [];

			for(let j=0; j!=toexplore.length; j++) {
				const exploreIndex = toexplore[j];
				explored.push(exploreIndex);
				const links = this.getLinks(exploreIndex);
				const reverseLinks = this.getReverseLinks(exploreIndex);
				
				for(let k=0; k!=links.length; k++) { // NOSONAR complexity is OK
					const index = links[k].target;

					if(explored.indexOf(index) < 0 && toexplorenext.indexOf(index) < 0 && toexplore.indexOf(index) < 0) { // NOSONAR complexity is OK
						newAfter.push(index);
						toexplorenext.push(index);
					}
				}
				
				for(let k=0; k!=reverseLinks.length; k++) { // NOSONAR complexity is OK
					const index = reverseLinks[k].target;
					
					if(explored.indexOf(index) < 0 && toexplorenext.indexOf(index) < 0 && toexplore.indexOf(index) < 0) { // NOSONAR complexity is OK
						newBefore.push(index);
						toexplorenext.push(index);
					}
				}
			}
			
			before[i] = newBefore;
			after[i] = newAfter;
			toexplore = toexplorenext;
			
		}
		
		return {
			"before" : before,
			"after"  : after
		};
	}

	this.getAllPaths = function(startIndex, endIndex, reverse) {
		const path = [ startIndex ];
		return this.getAllPathsDFS(endIndex, path, reverse);
	}

	this.getAllPathsDFS = function(endIndex, path, reverse) {
		const index = path[path.length-1];
		
		if(index == endIndex) {
			return [ path ];
		}

		const retPaths = [];
		const links = reverse ? this.vertexes[index].reverseLinks : this.vertexes[index].links;
		for(let l=0; l!=links.length; l++) {
			const target = links[l].target;
			
			// protection against cycles
			if(path.indexOf(target) >= 0) {
				continue;
			}
			
			if(links[l].properties.doNotUseForPath) {
				continue;
			}
			
			const linkPath = [];
			for(let i=0; i!=path.length; i++) {
				linkPath[i] = path[i];
			}
			linkPath[path.length] = target;
			const linkPaths = this.getAllPathsDFS(endIndex, linkPath, reverse);
			
			for(let i=0; i!=linkPaths.length; i++) {
				retPaths.push(linkPaths[i]);
			}
		}
		
		return retPaths;
	}
	
}

function copyArrayPlusValue(arr, val) {
	const newarr = [];
	for(let i=0; i!=arr.length; i++) {
		newarr[i] = arr[i];
	}
	newarr[arr.length] = val;
	return newarr;
}

function copyArrayPlusArray(arr1, arr2) {
	const newarr = [];
	for(let i=0; i!=arr1.length; i++) {
		newarr[i] = arr1[i];
	}
	for(let j=0; j!=arr2.length; j++) {
		newarr[arr1.length+j] = arr2[j];
	}
	return newarr;
}
