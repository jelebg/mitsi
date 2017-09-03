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

	this.runSql = function(sqlEntry, datasourceName, sqlText, cancelSqlId, timeout, count, canceler) {
		return mitsiHttpService.postForSql(sqlEntry, 'rest/runSql', canceler, { 
			"datasourceName" : datasourceName,
			"sqlText"        : sqlText,
			"cancelSqlId"    : cancelSqlId,
			"timeout"        : timeout,
			"count"          : count
		});
	}
	
	this.cancelSql = function(sqlEntry, cancelSqlId) {
		return mitsiHttpService.postForSql(sqlEntry, 'rest/cancelSql', null, { 
			cancelSqlId : cancelSqlId 
		});
	}

	this.cancelAllSql = function() {
		return mitsiHttpService.postForSql(null, 'rest/cancelSql', null, { 
			cancelSqlId : null
		});
	}

	this.sqlStatus = function() {
		return mitsiHttpService.postForSql(null, 'rest/sqlStatus', null, {});
	}

});