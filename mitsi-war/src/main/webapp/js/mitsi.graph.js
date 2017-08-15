// TODO : supprimer les références à Eppstein et remplacer par du BFS, valable ici pour un K-shortest

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
			
			if(dobj.id.type != "table" && dobj.id.type != "matview"  && dobj.id.type != "view") {
				continue;
			}
			
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
		if (!column.candidateFks) {
			return;
		}
		
		let candidateFks = column.candidateFks;
		for (let i=0; i!=candidateFks.length; i++) {
			let candidateFk = candidateFks[i];
			
			let fromIndex = this.getIndex(dobj.id.schema, dobj.id.name);
			if (!fromIndex) {
				continue;
			}
			let from = this.getVertex(fromIndex);
			
			let toIndex = this.getIndex(candidateFk.targetTableName);
			if (!toIndex) {
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

	
	/*	  
	this.initWithRelations = function(relations) { // NOSONAR copmplexity is OK
		// order relations by tableOwner/tableName/keyColumnsStr/rTableOwner/rTableName/rKeyColumnsStr
		relations.sort(function(a, b) {
			let lc = a.tableOwner.localeCompare(b.tableOwner);
			if(lc != 0) {
				return lc;
			}
			lc = a.tableName.localeCompare(b.tableName);
			if(lc != 0) {
				return lc;
			}
			lc = a.keyColumnsStr.localeCompare(b.keyColumnsStr);
			if(lc != 0) {
				return lc;
			}
			lc = a.rTableOwner.localeCompare(b.rTableOwner);
			if(lc != 0) {
				return lc;
			}
			lc = a.rTableName.localeCompare(b.rTableName);
			if(lc != 0) {
				return lc;
			}
			lc = a.rKeyColumnsStr.localeCompare(b.rKeyColumnsStr);
			return lc;
		});
		
		// d'abord on crée une entrée pour chaque sommet
		for(let i=0; i!=relations.length; i++) {
			const relation = relations[i];
			
			this.createVertexIfNecessary(relation.tableOwner+"."+relation.tableName);
			this.createVertexIfNecessary(relation.rTableOwner+"."+relation.rTableName);
		
		}
		
		// ensuite on popule les relations de chaque sommet
		for(let i=0; i!=relations.length; i++) {
			const relation = relations[i];
			
			const pos  = this.nameTable[relation.tableOwner+"."+relation.tableName];
			const rpos = this.nameTable[relation.rTableOwner+"."+relation.rTableName];
			const v = this.vertexes[pos];
			const rv = this.vertexes[rpos];
			let linkAlreadyExists = false;
			for(let j=0; j!=v.links.length; j++) {
				const l = v.links[j];
				if(l.target == rpos) {
					linkAlreadyExists = true;
					break;
				}
			}
			
			if(linkAlreadyExists) {
				// if a link already exists in the same direction between the 2 tables, 
				// do not create a new link but put new properties in existing link and reverse link
				// TODO remove ? l.properties.keyColumns  +=  "\n"+relation.keyColumns.join(",");
				// l.properties.rKeyColumns +=  "\n"+relation.rKeyColumns.join(","); 
				
				let l = null;
				for(let j=0; j!=rv.reverseLinks.length; j++) {
					l = rv.reverseLinks[j];
					if(l.target == rpos) { // NOSONAR complexity is OK
						break;
					}
				}
				
				if(l) {
					l.properties.keyColumns  +=  "\n"+relation.keyColumns.join(",");
					l.properties.rKeyColumns +=  "\n"+relation.rKeyColumns.join(",");
				}
				
			}
			else {
				// if no link exists in the same direction between the 2 tables, create a new link 
				const newLink = {
					"target"     : rpos,
					"targetName" : relation.rTableOwner+"."+relation.rTableName,
					"properties" : {
						"keyColumns"  : relation.keyColumns.join(","),
						"rKeyColumns" : relation.rKeyColumns.join(",")
					}
				};
				
				v.links.push(newLink);
				
				const newReverseLink = {
					"target"     : pos,
					"targetName" : relation.tableOwner+"."+relation.tableName,
					"properties" : {
						"keyColumns"  : relation.keyColumns.join(","),
						"rKeyColumns" : relation.rKeyColumns.join(",")
					}
				};
				
				rv.reverseLinks.push(newReverseLink);
			}
		}
	}*/
	

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

	
	this.getKShortestPathBFSTreeSort = function(a, b) {
		if(a.dt > b.dt) {
			return 1;
		}
		if(a.dt < b.dt) {
			return -1;
		}
		return 0;
	}
	
	this.getKShortestPathBFSTreePush = function(tree, sidetrackpath, stDistance) { // NOSONAR complexity is OK
		let removeone = false;
		let current = tree;
		let topmost = true;
		for(let i=0; i!=sidetrackpath.length; i++) { // NOSONAR complexity is OK
			const st = sidetrackpath[i];
			let c = current.childs[st];
			if(c) {
				if(current.sortedChilds.length>0 &&
						current.sortedChilds[current.sortedChilds.length-1] != st) {
					topmost = false;
				} 
				current = c;
				continue;
			}
			
			// if alredy max node in tree and this node is greater, must not add it 
			if( tree.nbChilds == tree.maxChilds &&
				topmost && 
				(current.sortedChilds.length==0 || 
					current.sortedChilds[current.sortedChilds.length-1].dt < stDistance)) {
				break;
			}
				
			c = {
				arr : sidetrackpath,
				dt : stDistance,
				childs : {} ,
				sortedChilds : [],
				prev : current
			}
			current.childs[st] = c;
			current.sortedChilds.push(st);
			// TODO : so horrible, a tree would have been far better should be OK for k < 10
			current.sortedChilds.sort(this.getKShortestPathBFSTreeSort);
			
			if(i != sidetrackpath.length-1) {
				// normally, nodes should be added only at the tip of the tree
				console.log("ERROR !!! when build Eppstein side tracks tree"); // NOSONAR : this code will be deleted
			}

			if(tree.nbChilds < tree.maxChilds) {
				tree.nbChilds ++;
			}
			else {
				removeone = true;
			}
		}

		if(removeone) {
			let current = tree;
			while(current.sortedChilds.length > 0) {
				current = current.sortedChilds[current.sortedChilds.length-1];
			}
			
			const toremove = current.sortedChilds.pop();
			delete current.childs[toremove];
		}

	}
	
	this.getKShortestPathBFS = function(tEppstein, tree, visited, tovisit) { // NOSONAR complexity is OK
		const newtovisit = [];
		
		for(let i=0; i!=tovisit.length; i++) {
			const visiting = tovisit[i];
			
			// add in tree only if not shortest path
			let sidetrackpath = visiting.prevpath;
			if(visiting.dt > 0) {
				sidetrackpath = copyArrayPlusValue(visiting.prevpath, visiting.i);
				// todo : add distance information somewhere
				this.getKShortestPathBFSTreePush(tree, sidetrackpath, visiting.dt);
			}
			
			// order tree by distance
			// TODO : should not be here ??!!!
			// this.getKShortestPathOrderTreeByDistance(tree);
			
			// add new vertices to visit if current not already visited
			// (protection against cycles)
			//if(visited.indexOf(visiting.i) >= 0) {
			//	continue;
			//}
			const tEppsteinEntry = tEppstein[visiting.i];
			//  if tEppsteinEntry does exist, either there is no path via this target or it is the endIndex
			if(tEppsteinEntry) {
				const ls = tEppsteinEntry.ls; 
				for(let j=0; j!=ls.length; j++) {
					if(ls[j]) { // NOSONAR complexity is OK
						// protection against cycles
						// TODO : check if it works
						if(visited.indexOf(ls[j].t) >= 0) {
							continue;
						}
						newtovisit.push( { i:ls[j].t , prevpath:sidetrackpath , dt:(/*visiting.dt+*/ls[j].dt) } );
					}
				}
				
			}
				
			visited.push(visiting.i);
		}
		
		return newtovisit;
	}
	
	this.getKShortestSliceTree = function(tree, k) {
		// TODO : use precomputed order
		var cnt = 1;
		for(let i=0; i!=tree.sortedChilds.length; i++) {
			cnt += this.getKShortestSliceTree(tree.sortedChilds[i]);
			if(cnt > k) {
				tree.sortedChilds = tree.sortedChilds.slice(0, i+1);
				break;
			}
		}

		return cnt;
	}
	
	this.getKShortestPathFromTreeDFS = function(tEppstein, tree, path, endIndex) {
		const index = path[path.length-1];
		
		if(index == endIndex) {
			return [ path ];
		}

		const retPaths = [];
		const tEppsteinIndex = tEppstein[index];
		if(!tEppsteinIndex) {
			return retPaths;
		}
		for(let i=0; i!=tEppsteinIndex.ls.length; i++) { // NOSONAR complexity is OK
			const l = tEppsteinIndex.ls[i];
			if(!l) {
				continue;
			}

			// TODO BUG TODOBUG : bug car actuellement tree commence par vide puis startIndex avant d'attaquer les éventuels target 
			const treeChild = tree ? tree.childs[l.t] : tree;
			if(l.dt>0 && !treeChild) {
				continue;
			} 
			
			// TODO : protection against cycles
			const tPath = copyArrayPlusValue(path, l.t);
			
			const nextPaths = this.getKShortestPathFromTreeDFS(tEppstein, treeChild, tPath, endIndex);

			for(let j=0; j!=nextPaths.length; j++) {
				retPaths.push(nextPaths[j]);
			}
		}
		
		return retPaths;
	}
	
	this.getKShortestPathFromTree = function(tEppstein, tree, k, startIndex, endIndex) {
		// TODO optimize by removing nodes during insertion in tree when more than k nodes ?
		//this.getKShortestSliceTree(tree, k);
		
		const path = [startIndex];
		// let paths = [];
		/*for(var i=0; i!=tree.sortedChilds.length; i++) {
			var subtree = tree.sortedChilds[i];
			var pathsSub = this.getKShortestPathFromTreeDFS(tEppstein, subtree, path, endIndex);
			
			for(var j=0; j!=pathsSub.length; j++) {
				paths.push(pathsSub[j]);
			}
		}*/
		return this.getKShortestPathFromTreeDFS(tEppstein, tree, path, endIndex);
	}
	
	this.getKShortestPath = function(tEppstein, startIndex, endIndex, k) {
		
		// build tree
		// firs node is an empty array of side tracks
		const visited = [];
		let tovisit = [ {i:startIndex, prevpath:[], dt:0} ]; 
		const tree = {
			arr : [],
			dt : 0,
			childs : {},
			sortedChilds : [],
			maxChilds : k-1,
			nbChilds : 0
		}
		while(tovisit.length > 0) {
			tovisit = this.getKShortestPathBFS(tEppstein, tree, visited, tovisit);
		}
		
		//this.getKShortestPathOrderTreeByDistance(tree);
		
		//compute final paths
		return this.getKShortestPathFromTree(tEppstein, tree, k, startIndex, endIndex);
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
