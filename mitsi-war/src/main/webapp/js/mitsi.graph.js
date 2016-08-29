// TODO : supprimer les références à Eppstein et remplacer par du BFS, valable ici pour un K-shortest

function MitsiGraph(relations) {
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
	
	this.initWithDatabaseObjects = function(databaseObjects) {
		// create vertices
		for(var i=0; i!=databaseObjects.length; i++) {
			var dobj = databaseObjects[i];
			
			if(dobj.id.type != "table" && dobj.id.type != "matview") {
				continue;
			}
			
			this.createVertexIfNecessary(dobj.id.schema+"."+dobj.id.name);

		}
		
		// create links
		for(var i=0; i!=databaseObjects.length; i++) {
			var dobj = databaseObjects[i];
			
			if(dobj.id.type != "table" && dobj.id.type != "matview") {
				continue;
			}
			
			var pos = this.nameTable[dobj.id.schema+"."+dobj.id.name];
			var v = this.vertexes[pos];
			for(var k=0; k!=dobj.constraints.length; k++) {
				var constraint = dobj.constraints[k];
				
				if(constraint.type != 'R') {
					continue;
				}
				
				var rpos = this.nameTable[constraint.fkConstraintOwner+"."+constraint.fkTable];
				var rv = this.vertexes[rpos];
				var linkAlreadyExists = false;
				for(var j=0; j!=v.links.length; j++) {
					var l = v.links[j];
					if(l.target == rpos) {
						linkAlreadyExists = true;
						break;
					}
				}
				
				if(linkAlreadyExists) {
					// if a link already exists in the same direction between the 2 tables, 
					// do not create a new link but put new properties in existing link and reverse link
					l.properties.keyColumns  +=  "\n"+constraint.columns;
					l.properties.rKeyColumns +=  "\n"+constraint.fkColumns;
					
					for(var j=0; j!=rv.reverseLinks.length; j++) {
						var l = rv.reverseLinks[j];
						if(l.target == rpos) {
							break;
						}
					}
					
					l.properties.keyColumns  +=  "\n"+constraint.columns;
					l.properties.rKeyColumns +=  "\n"+constraint.fkColumns;
					
				}
				else {
					// if no link exists in the same direction between the 2 tables, create a new link 
					var newLink = {
						"target"     : rpos,
						"targetName" : constraint.fkConstraintOwner+"."+constraint.fkTable,
						"properties" : {
							"keyColumns"  : constraint.columns,
							"rKeyColumns" : constraint.fkColumns
						}
					};
					
					v.links.push(newLink);
					
					var newReverseLink = {
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
	}
	
	this.initWithRelations = function(relations) {
		// order relations by tableOwner/tableName/keyColumnsStr/rTableOwner/rTableName/rKeyColumnsStr
		relations.sort(function(a, b) {
			var lc = a.tableOwner.localeCompare(b.tableOwner);
			if(lc != 0) return lc;
			lc = a.tableName.localeCompare(b.tableName);
			if(lc != 0) return lc;
			lc = a.keyColumnsStr.localeCompare(b.keyColumnsStr);
			if(lc != 0) return lc;
			lc = a.rTableOwner.localeCompare(b.rTableOwner);
			if(lc != 0) return lc;
			lc = a.rTableName.localeCompare(b.rTableName);
			if(lc != 0) return lc;
			lc = a.rKeyColumnsStr.localeCompare(b.rKeyColumnsStr);
			return lc;
		});
		
		// d'abord on crée une entrée pour chaque sommet
		for(var i=0; i!=relations.length; i++) {
			var relation = relations[i];
			
			this.createVertexIfNecessary(relation.tableOwner+"."+relation.tableName);
			this.createVertexIfNecessary(relation.rTableOwner+"."+relation.rTableName);
		
		}
		
		// ensuite on popule les relations de chaque sommet
		for(var i=0; i!=relations.length; i++) {
			var relation = relations[i];
			
			var pos  = this.nameTable[relation.tableOwner+"."+relation.tableName];
			var rpos = this.nameTable[relation.rTableOwner+"."+relation.rTableName];
			var v = this.vertexes[pos];
			var rv = this.vertexes[rpos];
			var linkAlreadyExists = false;
			for(var j=0; j!=v.links.length; j++) {
				var l = v.links[j];
				if(l.target == rpos) {
					linkAlreadyExists = true;
					break;
				}
			}
			
			if(linkAlreadyExists) {
				// if a link already exists in the same direction between the 2 tables, 
				// do not create a new link but put new properties in existing link and reverse link
				l.properties.keyColumns  +=  "\n"+relation.keyColumns.join(",");
				l.properties.rKeyColumns +=  "\n"+relation.rKeyColumns.join(",");
				
				for(var j=0; j!=rv.reverseLinks.length; j++) {
					var l = rv.reverseLinks[j];
					if(l.target == rpos) {
						break;
					}
				}
				
				l.properties.keyColumns  +=  "\n"+relation.keyColumns.join(",");
				l.properties.rKeyColumns +=  "\n"+relation.rKeyColumns.join(",");
				
			}
			else {
				// if no link exists in the same direction between the 2 tables, create a new link 
				var newLink = {
					"target"     : rpos,
					"targetName" : relation.rTableOwner+"."+relation.rTableName,
					"properties" : {
						"keyColumns"  : relation.keyColumns.join(","),
						"rKeyColumns" : relation.rKeyColumns.join(",")
					}
				};
				
				v.links.push(newLink);
				
				var newReverseLink = {
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
				
	}
	

	this.getLinksByName = function(tableOwner, tableName) {
		var pos = this.nameTable[tableOwner+(tableName?"."+tableName:"")];
		if(pos == undefined) {
			return null;
		}
		return this.vertexes[pos].links;
	}
	
	this.getLinks= function(index) {
		return this.vertexes[index].links;
	}
	
	this.getReverseLinksByName = function(tableOwner, tableName) {
		var pos = this.nameTable[tableOwner+(tableName?"."+tableName:"")];
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
	
	this.getProximityGraph = function(index, depth) {
		var toexplore = [ index ];
		var explored = [];
		var before = [];
		var after = [];
		
		for(var i=0; i!=depth; i++) {
			var newBefore = [];
			var newAfter = [];
			var toexplorenext = [];

			for(var j=0; j!=toexplore.length; j++) {
				var exploreIndex = toexplore[j];
				explored.push(exploreIndex);
				var links = this.getLinks(exploreIndex);
				var reverseLinks = this.getReverseLinks(exploreIndex);
				
				for(var k=0; k!=links.length; k++) {
					var index = links[k].target;

					if(explored.indexOf(index) < 0 && toexplorenext.indexOf(index) < 0 && toexplore.indexOf(index) < 0) {
						newAfter.push(index);
						toexplorenext.push(index);
					}
				}
				
				for(var k=0; k!=reverseLinks.length; k++) {
					var index = reverseLinks[k].target;
					
					if(explored.indexOf(index) < 0 && toexplorenext.indexOf(index) < 0 && toexplore.indexOf(index) < 0) {
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
	
	this.computeDijkstra = function(startIndex, reverse) {
		var t = [];
		var visited = []
		var unvisited = [startIndex]
		
		t[startIndex] = { d:0, p:-1 };
		
		do {
			var current = unvisited.pop();
			visited[current] = true;
			
			var v = this.vertexes[current];
			var ls = reverse ? v.reverseLinks : v.links;
			for(var i=0; i!=ls.length; i++) {
				var l = ls[i];
				
				if(!t[l.target] || t[l.target].d > t[current].d+1) {
					t[l.target] = { d:t[current].d+1, p:current };
				}
				
				if(visited[l.target]) {
					continue;
				}
				
				unvisited.push(l.target);
			}
			
		} while(unvisited.length > 0);
		
		return t;
	}
	
	this.getShortestPath = function(dijkstraTable, startIndex, endIndex) {
		// TODO : trouver pourquoi dans le path on a parfois des entiers, parfois des string
		var path = [];
		
		var current = endIndex;
		path.push(current);
		while(dijkstraTable[current] && dijkstraTable[current].p != -1) {
			current = dijkstraTable[current].p;
			path.push(current);
		}
			
		if(current != startIndex) {
			return null;
		}
		return path.reverse();
	}
	
	this.computeEppstein = function(startIndex, endIndex, reverse) {
		var t = [];
		
		var tDijkstra = this.computeDijkstra(endIndex, !reverse);
		for(var i=0; i!=this.vertexes.length; i++) {
			
			var nt = {
				// d : tDijkstra[i].d, should be useless
				ls : []
			}
			
			var links = reverse ? this.vertexes[i].reverseLinks : this.vertexes[i].links;
			for(var l=0; l!=links.length; l++) {
				var target = tDijkstra[links[l].target];
				if(!target || target.d < 0) { // TODO target.d should not be <0
					// unreachable vertex
					continue;
				}

				nt.ls[l] = {
					t  : links[l].target,
					dt : 1 + target.d - tDijkstra[i].d
				};
			}
				
			if(nt.ls.length > 0) {
				t[i] = nt;
			}
		}
		
		
		
		
		return t;
	}
	
	this.getAllEqualsShortestPathDFS = function(tEppstein, path, endIndex) {
		var index = path[path.length-1];
		
		if(index == endIndex) {
			return [ path ];
		}

		var retPaths = [];
		var tEppsteinIndex = tEppstein[index];
		if(!tEppsteinIndex) {
			return retPaths;
		}
		for(var i=0; i!=tEppsteinIndex.ls.length; i++) {
			var l = tEppsteinIndex.ls[i];
			if(!l || l.dt > 0) {
				continue;
			}
			// TODO : protection against cycles
			var tPath = [];
			for(var j=0; j!=path.length; j++) {
				tPath[j] = path[j];
			}
			tPath[j] = l.t;
			
			var nextPaths = this.getAllEqualsShortestPathDFS(tEppstein, tPath, endIndex);

			for(var j=0; j!=nextPaths.length; j++) {
				retPaths.push(nextPaths[j]);
			}
		}
		
		return retPaths;
	}
	
	this.getAllEqualsShortestPath = function(tEppstein, startIndex, endIndex) {
		var path = [ startIndex ];
		var paths = this.getAllEqualsShortestPathDFS(tEppstein, path, endIndex);
		return paths;
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
	
	this.getKShortestPathBFSTreePush = function(tree, sidetrackpath, stDistance) {
		var removeone = false;
		var current = tree;
		var topmost = true;
		for(var i=0; i!=sidetrackpath.length; i++) {
			var st = sidetrackpath[i];
			var c = current.childs[st];
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
				console.log("ERROR !!! when build Eppstein side tracks tree");
			}

			if(tree.nbChilds < tree.maxChilds) {
				tree.nbChilds ++;
			}
			else {
				removeone = true;
			}
		}

		if(removeone) {
			var current = tree;
			while(current.sortedChilds.length > 0) {
				current = current.sortedChilds[current.sortedChilds.length-1];
			}
			
			var toremove = current.sortedChilds.pop();
			delete current.childs[toremove];
		}

	}
	
	/*this.getKShortestPathOrderTreeByDistance = function(tree) {
		// TODO would be so much faster and easy to program with a true stack 
		var newchilds = [];
		for(var k in tree.childs) {
			var child = tree.childs[k];
			newchilds.push(child);
			
			this.getKShortestPathOrderTreeByDistance(child);
		}
		
		newchilds.sort(function(a, b) {
			if(a.dt > b.dt) {
				return 1;
			}
			if(a.dt < b.dt) {
				return -1;
			}
			return 0;
		});
		tree.sortedChilds = newchilds;
	}*/
	
	this.getKShortestPathBFS = function(tEppstein, tree, visited, tovisit) {
		var newtovisit = [];
		
		for(var i=0; i!=tovisit.length; i++) {
			var visiting = tovisit[i];
			
			// add in tree only if not shortest path
			var sidetrackpath = visiting.prevpath;
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
			var tEppsteinEntry = tEppstein[visiting.i];
			//  if tEppsteinEntry does exist, either there is no path via this target or it is the endIndex
			if(tEppsteinEntry) {
				var ls = tEppsteinEntry.ls; 
				for(var j=0; j!=ls.length; j++) {
					if(ls[j]) {
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
		for(var i=0; i!=tree.sortedChilds.length; i++) {
			cnt += this.getKShortestSliceTree(tree.sortedChilds[i]);
			if(cnt > k) {
				tree.sortedChilds = tree.sortedChilds.slice(0, i+1);
				break;
			}
		}

		return cnt;
	}
	
	this.getKShortestPathFromTreeDFS = function(tEppstein, tree, path, endIndex) {
		var index = path[path.length-1];
		
		if(index == endIndex) {
			return [ path ];
		}

		var retPaths = [];
		var tEppsteinIndex = tEppstein[index];
		if(!tEppsteinIndex) {
			return retPaths;
		}
		for(var i=0; i!=tEppsteinIndex.ls.length; i++) {
			var l = tEppsteinIndex.ls[i];
			if(!l) {
				continue;
			}

			// TODO BUG TODOBUG : bug car actuellement tree commence par vide puis startIndex avant d'attaquer les éventuels target 
			var treeChild = tree ? tree.childs[l.t] : tree;
			if(l.dt>0 && !treeChild) {
				continue;
			} 
			
			// TODO : protection against cycles
			var tPath = copyArrayPlusValue(path, l.t);
			
			var nextPaths = this.getKShortestPathFromTreeDFS(tEppstein, treeChild, tPath, endIndex);

			for(var j=0; j!=nextPaths.length; j++) {
				retPaths.push(nextPaths[j]);
			}
		}
		
		return retPaths;
	}
	
	this.getKShortestPathFromTree = function(tEppstein, tree, k, startIndex, endIndex) {
		// TODO optimize by removing nodes during insertion in tree when more than k nodes ?
		//this.getKShortestSliceTree(tree, k);
		
		var path = [startIndex];
		var paths = [];
		/*for(var i=0; i!=tree.sortedChilds.length; i++) {
			var subtree = tree.sortedChilds[i];
			var pathsSub = this.getKShortestPathFromTreeDFS(tEppstein, subtree, path, endIndex);
			
			for(var j=0; j!=pathsSub.length; j++) {
				paths.push(pathsSub[j]);
			}
		}*/
		paths = this.getKShortestPathFromTreeDFS(tEppstein, tree, path, endIndex);
		
		return paths;
	}
	
	this.getKShortestPath = function(tEppstein, startIndex, endIndex, k) {
		
		// build tree
		// firs node is an empty array of side tracks
		var visited = [];
		var tovisit = [ {i:startIndex, prevpath:[], dt:0} ]; 
		var tree = {
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
		var index = path[path.length-1];
		
		if(index == endIndex) {
			return [ path ];
		}

		var retPaths = [];
		var links = reverse ? this.vertexes[index].reverseLinks : this.vertexes[index].links;
		for(var l=0; l!=links.length; l++) {
			var target = links[l].target;
			
			// protection against cycles
			if(path.indexOf(target) >= 0) {
				continue;
			}
			
			var linkPath = [];
			for(var i=0; i!=path.length; i++) {
				linkPath[i] = path[i];
			}
			linkPath[i] = target;
			var linkPaths = this.getAllPathsDFS(endIndex, linkPath, reverse);
			
			for(var i=0; i!=linkPaths.length; i++) {
				retPaths.push(linkPaths[i]);
			}
		}
		
		return retPaths;
	}
		
	this.getAllPaths = function(startIndex, endIndex, reverse) {
		var path = [ startIndex ];
		var paths = this.getAllPathsDFS(endIndex, path, reverse) ;
		return paths;
	}
	
	this.getMaxConnectedNode = function() {
		var max = -1;
		var mvi = -1;
		for(var i=0; i!=this.vertexes.length; i++) {
			var v = this.vertexes[i];
			if(v.reverseLinks.length > max) {
				mvi = i;
				max = v.reverseLinks.length;
			}
		}
		return mvi;
	}
}

function copyArrayPlusValue(arr, val) {
	var newarr = [];
	for(var i=0; i!=arr.length; i++) {
		newarr[i] = arr[i];
	}
	newarr[i] = val;
	return newarr;
}

function copyArrayPlusArray(arr1, arr2) {
	var newarr = [];
	for(var i=0; i!=arr1.length; i++) {
		newarr[i] = arr1[i];
	}
	for(var j=0; j!=arr2.length; j++) {
		newarr[i+j] = arr2[j];
	}
	return newarr;
}