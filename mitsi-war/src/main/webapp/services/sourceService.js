angular.module('mitsiApp')
.service( 'sourceService', function(mitsiHttpService, $q) {
    let sourceService = this;

	this.getObjects = function(datasource, schema) {

	    if (!datasource.datasources || datasource.datasources.length == 0) {
	        return;
	    }

	    let allPromises = [];

		for (let i=0; i!=datasource.datasources.length; i++) {
		    allPromises.push(mitsiHttpService.postForDatasource(
		        datasource,
		        'rest/getDatabaseObjects',
		        {
                    "datasourceName" : datasource.datasources[i],
                    "schema" : schema
                }
            ));
		}

		if (allPromises.length == 1) {
		    let promise = allPromises[0];
		    //return allPromises[0];
            var d = $q.defer();

            promise.then(function(response) {
              let source = response.data;
              source.currentSchemaName = null;

              if(source.schemas) {
                  for(var i=0; i!=source.schemas.length; i++) {
                      if( source.schemas[i].current) {
                          source.currentSchemaName = source.schemas[i].name;
                          break;
                      }
                  }
              }

              d.resolve(response)
            },
            function(error) {
              d.reject(error);
            });

            return d.promise;
		}

        var d = $q.defer();

		$q.all(allPromises).then(function(responses) {
		        let startMs = new Date().getTime();
		        let merged = sourceService.mergeObjectsResponses(responses);
		        let endMs = new Date().getTime();
                console.log("merging time for " + datasource.datasources.join(", ") + " : " + (endMs-startMs)+"ms");

                d.resolve(merged);
            },
            function(error) {
                d.reject(error);
		    }
		);

        return d.promise;
	}

	this.getDiffDescription = function(nbLayers, foundLayerNameList) {
	    if (foundLayerNameList.length == nbLayers) {
	        return "Exists in all layers";
	    }
	    return "Exists in "+foundLayerNameList.join(", ");
	}

	this.mergeObjectsResponses = function(responses) {
	    // TODO : faire le bilan des différences simples (noms de colonnes), techniques (types des colonnes, index, contraintes, partitionnement), modele (fks), annexe (commentaire)

	    let merged = { data:{} };
	    let nbLayers = responses.length;

        merged.data.schemas = null; // TODO : would it be usefull to switch schema on a layer ? could be difficult since schemas may not exists on other databases

        merged.data.provider = distinctList(responses, function(x) { return x.data.provider; }).join(", ");

        // TODO : logique sur les schema a revoir certainement. il pourrait etre meilleur de les effacer, peut-être sur une configuration
        let schemaList = [];
        for (let i = 0; i != responses.length; i++) {
            let sourceSchemas = responses[i].data.schemas;

            if (!sourceSchemas) {
                continue;
            }

            for (let j=0; j!=sourceSchemas.length; j++) {
                if (sourceSchemas[j].current) {
                    schemaList.push(sourceSchemas[j].name);
                    break;
                }
            }
        }
        merged.data.currentSchemaName = distinctList(schemaList).join(" / ");

        let doNamesOrdered = [];
        let doNamesUnique = {};
        let doBySources = [];

        for (let i=0; i!=responses.length; i++) {
            let doBySourceCurrent = {};
            doBySources.push(doBySourceCurrent);

            for (let j=0; j!=responses[i].data.databaseObjects.length; j++) {
                let o = responses[i].data.databaseObjects[j];

                if (!doNamesUnique.hasOwnProperty(o.id.name)) {
                    doNamesOrdered.push(o.id.name);
                    doNamesUnique[o.id.name] = true;
                }

                doBySourceCurrent[o.id.name] = o;
            }
        }

        doNamesOrdered.sort();

        let databaseObjects = [];

        for (let i=0; i!=doNamesOrdered.length; i++) {
            let doName = doNamesOrdered[i];

            let foundList = [];
            let foundLayerNameList = [];
            for (let j=0; j!=doBySources.length; j++) {
                let doBySource = doBySources[j];
                let datasourceName = responses[j].data.datasourceName;
                let found = doBySource[doName];

                if (found) {
                    foundList.push(found);
                    foundLayerNameList.push(datasourceName);
                }
            }

            databaseObjects.push({
                "id" : {
                    "type"   : distinctList(foundList, function(x) { return x.id.type; }).join(", "),
		            "schema" : distinctList(foundList, function(x) { return x.id.schema; }).join(", "), // TODO : si le schema est le default, et qu'ils ne sont pas tous identiques, remplacer par chaine vide
		            "name"   : doName
		        },
		        "secondaryType"   : distinctList(foundList, function(x) { return x.secondaryType; }).join(", "),
		        "diffDescription" : sourceService.getDiffDescription(nbLayers, foundLayerNameList),
		        "description"     : distinctList(foundList, function(x) { return x.description; }).join(", "),
		        "columns"         : sourceService.mergeColumns(responses, foundList, function(x) { return x.columns; }), // TODO
		        "indexes"         : foundList[0].indexes, // TODO
		        "constraints"     : foundList[0].constraints, // TODO
		        "partitionned"    : distinctList(foundList, function(x) { return x.partitionned; }).join(", "),
		        "partitionningBy" : distinctList(foundList, function(x) { return x.partitionningBy; }).join(", "),
            })
        }

	    merged.data.databaseObjects = databaseObjects;

	    return merged;
	}

	this.mergeColumns = function(responses, foundList, getColumns) {
	    let columnsByResponse = [];
	    let columnIndexByResponse = [];
	    let columnNameCount = {};
	    let mergedColumns = [];

	    for (let i=0; i!=foundList.length; i++) {
	        let columns = getColumns(foundList[i]);
	        columnsByResponse[i] = columns;
	        columnIndexByResponse[i] = 0;

	        for (let j=0; j!=columns.length; j++) {
	            let columnName = columns[j].name;
	            if (columnNameCount.hasOwnProperty(columnName)) {
	                columnNameCount[columnName] = columnNameCount[columnName] + 1;
	            }
	            else {
	                columnNameCount[columnName] = 1;
	            }
	        }
	    }

	    for (;;) {
	        let minCount = 0;
	        let chosenFound = -1;
	        for (let i=0; i!=foundList.length; i++) {
	            if (columnIndexByResponse[i] >= columnsByResponse[i].length) {
	                continue;
	            }

	            let columnName = columnsByResponse[i][columnIndexByResponse[i]].name;
                let count = columnNameCount[columnName];
                if (minCount == 0 || count < minCount) {
                    minCount = count;
                    chosenFound = i;

                    // optim : if matches any columns, it is not necessaray to continue further ...
                    if (count == foundList.length) {
                        break;
                    }
                }
            }
            if (chosenFound == -1) {
                break;
            }

            let chosenName = columnsByResponse[chosenFound][columnIndexByResponse[chosenFound]].name;

            let columnDescriptions = [];
            let columnDescriptionsUnique = {};
            let columnLengths = [];
            let columnLengthsUnique = {};
            let columnTypes = [];
            let columnTypesUnique = {};
            let foundLayerNameList = [];

   	        for (let i=0; i!=foundList.length; i++) {
	            if (columnIndexByResponse[i] >= columnsByResponse[i].length) {
	                continue;
	            }

	            let column = columnsByResponse[i][columnIndexByResponse[i]];
	            columnIndexByResponse[i] = columnIndexByResponse[i] + 1;
	            if (column.name != chosenName) {
	                continue;
	            }

	            foundLayerNameList.push(responses[i].data.datasourceName);

                if (!columnDescriptionsUnique.hasOwnProperty(column.description)) {
                    columnDescriptionsUnique[column.description] = true;
                    columnDescriptions.push(column.description);
                }

                if (!columnLengthsUnique.hasOwnProperty(column.length)) {
                    columnLengthsUnique[column.length] = true;
                    columnTypes.push(column.length);
                }

                if (!columnTypesUnique.hasOwnProperty(column.type)) {
                    columnTypesUnique[column.type] = true;
                    columnLengths.push(column.type);
                }

            }

            let column = {
                "name" : chosenName,
   	            "diffDescription" : sourceService.getDiffDescription(responses.length, foundLayerNameList),
                "description" : columnDescriptions.join(" / "),
                "length" : columnLengths.join(" / "),
                "type" : columnTypes.join(" / ")
            }

            mergedColumns.push(column);
	    }

	    return mergedColumns;
	}

});