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

              if (source.schemas) {
                  for(var i=0; i!=source.schemas.length; i++) {
                      if( source.schemas[i].current) {
                          source.currentSchemaName = source.schemas[i].name;
                          break;
                      }
                  }
              }


              // TODO : check impact on performances
              if (source.databaseObjects) {
                for (let i=0; i!=source.databaseObjects.length; i++) {
                    let o = source.databaseObjects[i];
                    o.diff = {
                      notEverywhere : false.toString(),
                      simple        : false.toString(),
                      technical     : false.toString(),
                      model         : false.toString(),
                      other         : false.toString()
                    }

                    for (k=0; k!=o.columns.length; k++) {
                        let column = o.columns[k];
                        column.diff = {
                            notEverywhere : false.toString(),
                            simple        : false.toString(),
                            technical     : false.toString(),
                            model         : false.toString(),
                            other         : false.toString()
                        }
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
		        let merged = mergeObjectsResponses(responses);
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

});