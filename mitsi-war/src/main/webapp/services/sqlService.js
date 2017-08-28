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

	this.runSql = function(sqlEntry, datasourceName, sqlText, count, canceler) {
		return mitsiHttpService.postForSql(sqlEntry, 'rest/runSql', canceler, { 
			"datasourceName" : datasourceName,
			"sqlText"        : sqlText,
			"count"          : count
		});
	}
	
	this.cancelSql = function(sqlEntry) {
		return mitsiHttpService.postForSql(sqlEntry, 'rest/cancelSql', null, { 
			runningSqlId : null // TODO : sql id
		});
	}

	this.cancelAllSql = function() {
		return mitsiHttpService.postForSql(sqlEntry, 'rest/cancelSql', null, { 
			runningSqlId : null
		});
	}
	
});