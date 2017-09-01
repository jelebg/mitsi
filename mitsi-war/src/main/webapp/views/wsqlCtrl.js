angular.module('mitsiApp')
    .controller('wsqlCtrl', function($scope, $rootScope, $q, $interval, sqlService) {

	$scope.editorOptions = {
		"lineWrapping" : true,
		"lineNumbers": true,
		"mode": "text/x-sql", // TODO : permettre de changer le dialecte ? mariadb, oracle, etc.
		"placeholder":"write some SQL here ..."
	};

    // TODO : faire des popovers
    // TODO : bind variables

    const DEFAULT_FETCH_SIZE = 50;
    
    $scope.SQL_STATUS = { 
    		NOTHING : 0,
    		RUNNING: 1
    };    
    	
	$scope.getEmptySqlEntry = function() {
		return {
		    "sqlText":"",
		    "result":[],
		    "columns":[],
		    "status":$scope.SQL_STATUS.NOTHING,
		    "error":null,
		    "timeout":"0"
		    };
	}
	
    $scope.timers = {};

    $scope.sqlList = [ $scope.getEmptySqlEntry() ];
    $scope.undoCommands = [];
    $scope.redoCommands = [];

	$scope.splitAndRun = function(i) {
		let previousSql = $scope.sqlList[i];
		let sql = $scope.sqlList[i].sqlText;

		let sqlParts = sql.split(";");
		
		let insertSqlList = [];
		for (let j=0; j!=sqlParts.length; j++) {
			let sqlText = sqlParts[j];
			if (sqlText.trim() == "") {
			    continue
			}
			
			let isEqualToPreviousSql = sqlText.trim() == previousSql.sqlText.trim();
			//let sqlResult = isEqualToPreviousSql ? previousSql.result : [];
			//let sqlColumns = isEqualToPreviousSql ? previousSql.columns : [];
			//let status = isEqualToPreviousSql ? $scope.SQL_STATUS.NOTHING : $scope.SQL_STATUS.TO_RUN;
			if (isEqualToPreviousSql) {
			    insertSqlList.push({
			        "sqlText":sqlText,
			        "result":previousSql.result,
			        "columns":previousSql.columns,
			        "status":$scope.SQL_STATUS.NOTHING,
			        "messages":previousSql.messages,
			        "maxRowsReached":previousSql.maxRowsReached
			    });
		    }
		    else {
			    insertSqlList.push({
			        "sqlText":sqlText,
			        "result":[],
			        "columns":[],
			        "status":$scope.SQL_STATUS.NOTHING,
                    "messages":null,
                    "maxRowsReached":false
			    });
		    }
		}
		
		let before = i == 0 ? [] : $scope.sqlList.slice(0, i);
		let after = i == $scope.sqlList.length - 1 ? [] : $scope.sqlList.slice(i+1);
		
		$scope.sqlList[i].sqlText = sqlParts[0];
		$scope.sqlList = before.concat(insertSqlList).concat(after);
		
		for (let j=before.length; j<before.length+insertSqlList.length; j++) {
			let sql = $scope.sqlList[j];
			if (sql.status == $scope.SQL_STATUS.TO_RUN) {
				$scope.sqlTextRun(j, sql.sqlText);
			}
		}
		
	}
	
	$scope.sqlRun = function(i) {
		let sql = $scope.sqlList[i].sqlText;
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

    $scope.increaseAndGetSqlId = function() {
        let sqlId = localStorage.getItem("sqlIdSequence");
        if (sqlId == null) {
            localStorage.setItem("sqlIdSequence", "0");
            return 0;
        }
        else {
            let sqlIdInt = parseInt(sqlId);
            localStorage.setItem("sqlIdSequence", sqlIdInt+1);
            return sqlIdInt+1;
        }
    }

	$scope.sqlTextRun = function(i, sql) {
		let sqlEntry = $scope.sqlList[i];
		
		if (!$rootScope.currentSource) { // TODO : afficher une erreur
			return;
		}
		
		sqlEntry.sqlId = "sqlId_" + $scope.increaseAndGetSqlId();

		sqlEntry.canceler = $q.defer();
		sqlEntry.cancelled = false;
		sqlService.runSql(sqlEntry, $rootScope.currentSource.name, sql, sqlEntry.sqlId, sqlEntry.timeout, DEFAULT_FETCH_SIZE, sqlEntry.canceler)
	    .then(function(response) {
				$scope.setSqlResult(i, response.data.results, response.data.columns, response.data.maxRowsReached, response.data.messages); // TODO
		    },
		    function(error) {
		    	$scope.setSqlResult(i, [], [], false, null);
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

	$scope.setSqlResult = function(i, result, columns, maxRowsReached, messages) {
		$scope.sqlList[i].result = result;
		$scope.sqlList[i].columns = columns;
		$scope.sqlList[i].maxRowsReached = maxRowsReached;
		$scope.sqlList[i].messages = messages;
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
			return;
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
		}
		else {
			$scope.sqlList.splice(i, 1);
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

	$scope.getShortSql = function(sqlEntry) {
	    let sqlText = sqlEntry.sqlText;
	    if (!sqlText || sqlText.trim() == "") {
	        return "(empty)";
	    }

        let short =
            sqlText.replace(/\s+/g, " ")
            .trim();
        if (short.length > 40) {
            short = short.substring(0, 40)+"...";
        }
	    return short;
	}
});