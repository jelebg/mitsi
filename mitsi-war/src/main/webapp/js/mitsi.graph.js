function MitsiGraph(relations) {
	this.nameTable = {};	
	this.vertexes = [];
	
	this.createVertexIfNecessary = function(name) {
		var pos = this.nameTable[name];
		if(!pos) {
			pos = this.vertexes.length;
			this.nameTable[name] = pos;
			this.vertexes[pos] = { 
				"name"  : name,
				"links" : [],
				"reverseLinks" : []
			};
		}
	}
	
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
		
		var newLink = {
			"target"     : rpos,
			"targetName" : relation.rTableOwner+"."+relation.rTableName,
			"properties" : {
				"keyColumns"  : relation.keyColumns.join(","),
				"rKeyColumns" : relation.rKeyColumns.join(",")
			}
		};
		
		var v = this.vertexes[pos];
		v.links.push(newLink);
		
		var newReverseLink = {
			"target"     : pos,
			"targetName" : relation.tableOwner+"."+relation.tableName,
			"properties" : {
				"keyColumns"  : relation.keyColumns.join(","),
				"rKeyColumns" : relation.rKeyColumns.join(",")
			}
		};

		var rv = this.vertexes[rpos];
		rv.reverseLinks.push(newReverseLink);

	}
	
	this.getLinksByName = function(tableOwner, tableName) {
		var pos = this.nameTable[tableOwner+(tableName?"."+tableName:"")];
		return this.vertexes[pos].links;
	}
	
	this.getLinks= function(index) {
		return this.vertexes[index].links;
	}
	
	this.getReverseLinksByName = function(tableOwner, tableName) {
		var pos = this.nameTable[tableOwner+(tableName?"."+tableName:"")];
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
				var links = graph.getLinks(exploreIndex);
				var reverseLinks = graph.getReverseLinks(exploreIndex);
				
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
	
}