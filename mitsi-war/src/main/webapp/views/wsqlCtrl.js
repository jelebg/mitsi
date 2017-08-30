angular.module('mitsiApp')
    .controller('wsqlCtrl', function($scope, $rootScope, $q, $interval, sqlService) {

    // TODO : faire une diretive pour les contenteditable
    // TODO : faire des popovers
    // TODO : bind variables
    // TODO : rajouter les numéros de ligne
    	
    const prefix = "sqlText_";
    const UNBREAKABLE_SPACE = "\xa0";
    const UNBREAKABLE_SPACE_REGEX_ALL = /\xa0/g;
    const DEFAULT_FETCH_SIZE = 50;
    
    $scope.SQL_STATUS = { 
    		NOTHING : 0,
    		TO_RUN: 1,
    		RUNNING: 2
    };    
    	
	$scope.getEmptySqlEntry = function() {
		return { "sqlText":"", "result":[], "columns":[], status:$scope.SQL_STATUS.NOTHING, "error":null, "timeout":"0" };
	}
	
    $scope.timers = {};
    $scope.sqlIdSequence = 0;
    
    $scope.sqlList = [ $scope.getEmptySqlEntry() ];
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
			let sqlColumns = isEqualToPreviousSql ? previousSql.columns : [];
			let status = isEqualToPreviousSql ? $scope.SQL_STATUS.NOTHING : $scope.SQL_STATUS.TO_RUN;
			insertSqlList.push({ "sqlText":sqlText, "result":sqlResult, "columns":sqlColumns, "status":status });
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
		let sqlEntry = $scope.sqlList[i];
		
		if (!$rootScope.currentSource) { // TODO : afficher une erreur
			return;
		}
		
		let cleanSql = sql.replace(UNBREAKABLE_SPACE_REGEX_ALL, ' ');
		$scope.sqlIdSequence ++;
		sqlEntry.sqlId = "sqlId_" + $scope.sqlIdSequence;
		
		
		sqlEntry.canceler = $q.defer();
		sqlEntry.cancelled = false;
		sqlService.runSql(sqlEntry, $rootScope.currentSource.name, cleanSql, sqlEntry.sqlId, sqlEntry.timeout, DEFAULT_FETCH_SIZE, sqlEntry.canceler)
	    .then(function(response) {
				$scope.setSqlResult(i, response.data.results, response.data.columns); // TODO
		    },
		    function(error) {
		    	$scope.setSqlResult(i, [], []);
		    }
		)
	    .finally(function () {
	    		sqlEntry.status = $scope.SQL_STATUS.NOTHING;
	    		$scope.stopTimer(sqlEntry);
	    	}
	    );
		sqlEntry.status = $scope.SQL_STATUS.RUNNING;
		$scope.startTimer(sqlEntry, sqlEntry.sqlId);
	}
	
	$scope.startTimer = function(sqlEntry, sqlId) {
		sqlEntry.beginTime = new Date().getTime();
		sqlEntry.endTime = null;
		sqlEntry.duration = " ";

		$scope.timers[sqlId] = $interval(function() {
			if (sqlEntry.endTime) {
				sqlEntry.duration = ((sqlEntry.endTime - sqlEntry.beginTime) / 1000)+"s";
				$interval.cancel($scope.timers[sqlId]);
				delete $scope.timers[sqlId];
			}
			else {
				sqlEntry.duration = Math.floor((new Date().getTime() - sqlEntry.beginTime) / 1000)+"s";
			}
		},
		1000);
	}
	$scope.stopTimer = function(sqlEntry) {
		sqlEntry.endTime = new Date().getTime();
	}

	$scope.setSqlResult = function(i, result, columns) {
		$scope.sqlList[i].result = result;
		$scope.sqlList[i].columns = columns;
	}
	
	$scope.sqlTextKeyPress = function(event, i) {
		if (event.key == 'F9') {
			$scope.sqlRun(i);
		}
		
		if (i == $scope.sqlList.length-1) {
			$scope.sqlList.push($scope.getEmptySqlEntry());
		}

	}
	
	$scope.sqlStop = function(i) {
		let sql = $scope.sqlList[i];
		
		if (sql.status != $scope.SQL_STATUS.RUNNING) {
			return; // TODO : message ?
		}
		
		sql.canceler.resolve();
		sql.canceler = null;
		sql.cancelled = true;
		
		sqlService.cancelSql(sql, sql.sqlId);

	}
	
	$scope.sqlStopAll = function() {
		for (let i=0; i!=$scope.sqlList.length; i++) {
			let sql = $scope.sqlList[i];
			if (sql.status == $scope.SQL_STATUS.RUNNING) {
				if (sql.canceler) {
					sql.canceler.resolve();
				}
				sql.canceler = null;
				sql.cancelled = true;
			}
		}
		
		sqlService.cancelAllSql();
	}
	
	$scope.sqlTrash = function(i) {
		if ($scope.sqlList[i].status == $scope.SQL_STATUS.RUNNING) {
			return;
		}			
			
		if (i==$scope.sqlList.length-1) {
			$scope.sqlList[i] = $scope.getEmptySqlEntry();
			$scope.setSqlText(i, "");
		}
		else {
			$scope.refreshSqlTexts();
			$scope.sqlList.splice(i, 1);
			$scope.restoreSqlTexts();
		}
	}
	
	$scope.sqlTrashAll = function() {
		for (let i=$scope.sqlList.length-2; i>=0; i--) {
			$scope.sqlTrash(i);
		}
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
	
	$scope.$on('$destroy', function(p1, p2, p3) { // NOSONAR keep the parameters
		for (let key in $scope.timers) {
			$interval.cancel($scope.timers[key]);
		}
		$scope.timers = {};
	});
});