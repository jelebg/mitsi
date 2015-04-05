// VERY VERY low cost event management :)

function EVENT_datasourceConnection(datasource) {
	refreshDatasource(datasource);

}

function EVENT_DatasourceUpdate(datasource) {
	refreshDatasource(datasource);

}

function EVENT_DatasourceSchemaChange(datasource) {
	refreshDatasource(datasource);

}


function EVENT_datasourceDisconnection(datasource) {
	// nothing yet
}
