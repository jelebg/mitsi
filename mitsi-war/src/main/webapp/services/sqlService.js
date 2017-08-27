angular.module('mitsiApp')
.service( 'sqlService', function(mitsiHttpService) {

	this.getData = function(datasourceName, owner, objectName, fromRow, count, orderByColumns, filters) {
		return mitsiHttpService.post('rest/getData', { 
			"datasourceName" : datasourceName,
			"owner"          : owner,
			"objectName"     : objectName,
			"fromRow"        : fromRow,
			"count"          : count,
			"orderByColumns" : orderByColumns,
			"filters"        : filters
		});
	}

	this.runSql = function(sqlEntry, datasourceName, sqlText, count) {
		return mitsiHttpService.postForSql(sqlEntry, 'rest/runSql', { 
			"datasourceName" : datasourceName,
			"sqlText"        : sqlText,
			"count"          : count
		});
	}

	
});