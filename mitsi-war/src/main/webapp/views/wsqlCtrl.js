angular.module('mitsiApp')
    .controller('wsqlCtrl', function($scope) {

    // TODO : faire une diretive pour les contenteditable
    // TODO : faire des popovers
    	
    const prefix = "sqlText_";
    const UNBREAKABLE_SPACE = "\xa0";
    
    $scope.SQL_STATUS = { 
    		NOTHING : 0,
    		TO_RUN: 1,
    		RUNNING: 2
    };    
    	
    $scope.sqlList = [ { "sqlText":"", "result":[], status:$scope.SQL_STATUS.NOTHING } ];
    $scope.undoCommands = [];
    $scope.redoCommands = [];
    
    	
	$scope.getSqlText = function(i) {
		return document.getElementById(prefix+i).innerText;
	}
	
	$scope.setSqlText = function(i, sqlText) {
		if (sqlText == null || sqlText.trim() == "") {
			sqlText = UNBREAKABLE_SPACE;
		}
		document.getElementById(prefix+i).innerText = sqlText;
	}
	
	$scope.notEmpty = function(sqlText) {
		if (sqlText == null || sqlText.trim()=="") {
			return UNBREAKABLE_SPACE;
		}
		return sqlText;
	}
	
	$scope.splitAndRun = function(i) {
		let previousSql = $scope.sqlList[i];
		let sql = $scope.getSqlText(i);

		let sqlParts = sql.split(";");
		
		let insertSqlList = [];
		for (let j=0; j!=sqlParts.length; j++) {
			let sqlText = sqlParts[j];
			
			let isEqualToPreviousSql = sqlText.trim() == previousSql.sqlText.trim();
			let sqlResult = isEqualToPreviousSql ? previousSql.result : [];
			let status = isEqualToPreviousSql ? $scope.SQL_STATUS.NOTHING : $scope.SQL_STATUS.TO_RUN;
			insertSqlList.push({ "sqlText":sqlText, "result":sqlResult, "status":status });
		}
		
		let before = i == 0 ? [] : $scope.sqlList.slice(0, i);
		let after = i == $scope.sqlList.length - 1 ? [] : $scope.sqlList.slice(i+1);
		
		$scope.setSqlText(i, sqlParts[0]);
		$scope.sqlList = before.concat(insertSqlList).concat(after);
		
		
		for (let j=before.length; j<before.length+insertSqlList.length; j++) {
			let sql = $scope.sqlList[j];
			if (sql.status == $scope.SQL_STATUS.TO_RUN) {
				$scope.sqlTextRun(j, sql.sqlText);
			}
		}
		
	}
	
	$scope.sqlRun = function(i) {
		let sql = $scope.getSqlText(i);
		if (sql==null || sql=="") {
			return;
		}
		
		if (sql.indexOf(';') >= 0) { // TODO : faire du PEGJS ici
			$scope.splitAndRun(i);
		}
		else {
			$scope.sqlTextRun(i, sql);
		}
	}
	
	$scope.sqlTextRun = function(i, sql) {
		$scope.sqlList[i].sqlText = sql;
		$scope.setSqlResult(i, [sql.trim().split(',')]); // TODO
		$scope.sqlList[i].status = $scope.SQL_STATUS.NOTHING;
	}
	
	$scope.setSqlResult = function(i, result) {
		$scope.sqlList[i].result = result;
		if (i == $scope.sqlList.length-1) {
			$scope.sqlList.push({ "sqlText":"", "result":[] })
		}
	}
	
	$scope.sqlTextKeyPress = function(event, i) {
		if (event.key == 'F9') {
			$scope.sqlRun(i);
		}
	}
	
	$scope.sqlStop = function(i) {
		let sql = $scope.sqlList[i];
		
		console.log("stop : "+i); // TODO
	}
	
	$scope.sqlStopAll = function(i) {
		let sql = $scope.sqlList[i];
		
		console.log("stop all"); // TODO
	}
	
	$scope.sqlTrash = function(i) {
		if (i==$scope.sqlList.length-1) {
			$scope.sqlList[i] = { "sqlText":"", "result":[], status:$scope.SQL_STATUS.NOTHING };
			$scope.setSqlText(i, "");
		}
		else {
			$scope.refreshSqlTexts();
			$scope.sqlList.splice(i, 1);
			$scope.restoreSqlTexts();
		}
	}
	
	$scope.sqlTrashAll = function(i) {
	    $scope.sqlList = [ { "sqlText":"", "result":[], status:$scope.SQL_STATUS.NOTHING } ];
		$scope.restoreSqlTexts();
	}
	
	$scope.isOneSqlStatus = function(status) {
		for (let i=0; i!=$scope.sqlList.length; i++) {
			if ($scope.sqlList[i].status == status) {
				return true;
			}
		}
		return false;
	}
	
	$scope.refreshSqlTexts = function() {
		for (let i=0; i!=$scope.sqlList.length; i++) {
			$scope.sqlList[i].sqlText = $scope.getSqlText(i);
		}
	}
	
	$scope.restoreSqlTexts = function() {
		for (let i=0; i!=$scope.sqlList.length; i++) {
			$scope.setSqlText(i, $scope.sqlList[i].sqlText);
		}
	}
	
	$scope.undo = function() {
		console.log("undo"); // TODO
	}

	$scope.redo = function() {
		console.log("redo"); // TODO
	}
});