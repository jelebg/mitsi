
function WorkbenchContext() {
	
	this.datasources = {};
	this.handsontable = null;


this.setDatasourceList = function (pDatasources) {
	// create datasources that does not already exist
	datasourceNames = [];
	
	for(var i=0; i!=pDatasources.length; i++) {
		var datasource = pDatasources[i];
		var datasourceName = datasource.name;
		
		ctxDatasource = this.datasources[datasourceName];
		if(ctxDatasource == null) {
			this.datasources[datasourceName] = datasource;
			datasourceNames.push(datasourceName);
		}
		else {
			ctxDatasource.tags = datasource.tags;
			ctxDatasource.description = datasource.description;
			ctxDatasource.connected = datasource.connected;
			ctxDatasource.schemas = datasource.schemas;
		}
	}
	
	// remove datasources that do not exist anymore
	// should not happen at the time being ...
	for(var myDatasource in this.datasources) {
		if(datasourceNames.indexOf(myDatasource) < 0) {
			this.datasources[myDatasource] = null;
		}
	}

}

this.setDatasourceObjects = function(datasourceName, objects) {
	datasource = this.datasources[datasourceName];
	if(datasource == null) {
		datasource = { name : datasourceName, objects:null };
		this.datasources[datasourceName] = datasource;
	}
	
	datasource.objects = objects;
}

this.getDatasource = function(datasourceName) {
	datasource = this.datasources[datasourceName];
	if(datasource == null) {
		datasource = { name : datasourceName, objects:null };
		this.datasources[datasourceName] = datasource;
	}
	
	return datasource;
}


};

var CONTEXT = new WorkbenchContext();



