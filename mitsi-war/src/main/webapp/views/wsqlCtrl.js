angular.module('mitsiApp')
    .controller('wsqlCtrl', function($scope, $rootScope, $q, $interval, $window, sqlService) {

	$scope.editorOptions = {
		"lineWrapping" : true,
		"lineNumbers": true,
		"mode": "text/x-sql", // TODO : permettre de changer le dialecte ? mariadb, oracle, etc.
		"placeholder":"write some SQL here ..."
	};

    // TODO : faire des popovers
    // TODO : bind variables
    // TODO : backup (toutes les secondes ?) des sql

    const DEFAULT_FETCH_SIZE = 50;
    const LOCAL_STORAGE_SQL_SEARCH = "sqlSearch";
    const LOCAL_STORAGE_SQL_LIST = "sqlList";

    $scope.SQL_STATUS = { 
    		NOTHING : 0,
    		RUNNING : 1,
    		RUNNING_FOR_TIME : 2
    };

	$scope.newEmptySqlEntry = function() {
		return {
		    "sqlText":"",
		    "result":[],
		    "columns":[],
		    "status":$scope.SQL_STATUS.NOTHING,
		    "error":null,
		    "timeout":"0"
		    };
	}

	$scope.newSqlEntry = function(sqlId, sqlText) {
		return {
		    "sqlId":sqlId,
		    "sqlText":sqlText,
		    "result":[],
		    "columns":[],
		    "status":$scope.SQL_STATUS.NOTHING,
		    "error":null,
		    "timeout":"0"
		    };
	}

    $scope.timers = {};

    $scope.searchSql = localStorage.getItem(LOCAL_STORAGE_SQL_SEARCH);
    $scope.sqlList = [ $scope.newEmptySqlEntry() ];
    $scope.undoCommands = [];
    $scope.redoCommands = [];

    $scope.backupSqlList = function() {
        let backup = [];
        for (let i=0; i!=$scope.sqlList.length; i++) {
            let sqlEntry = $scope.sqlList[i];
            backup.push({
                "sqlId"   : sqlEntry.sqlId,
                "sqlText" : sqlEntry.sqlText
            });
        }
        let backupJson = JSON.stringify(backup);
        localStorage.setItem(LOCAL_STORAGE_SQL_LIST, backupJson);
    }

    $scope.restoreSqlList = function() {
        let backupJson = localStorage.getItem(LOCAL_STORAGE_SQL_LIST);

        if (!backupJson) {
            return;
        }

        let backup = JSON.parse(backupJson);
        $scope.sqlList = [];
        for (let i=0; i!=backup.length; i++) {
            let backupSql = backup[i];
            $scope.sqlList.push($scope.newSqlEntry(
                backupSql.sqlId,
                backupSql.sqlText
            ));
        }

        sqlService.sqlStatus()
        .then(function(response) {
                let statusList = response.data.statusList;
                if (!statusList) {
                    return;
                }
                let missedRunningSqlCount = statusList.length;

                let statusMap = {};
                for(let i=0; i!=statusList.length; i++) {
                    let status = statusList[i];
                    statusMap[status.sqlId] = status;
                }

                for(let i=0; i!=$scope.sqlList.length; i++) {
                    let sqlEntry = $scope.sqlList[i];
                    if (!sqlEntry.sqlId) {
                        continue;
                    }

                    let status = statusMap[sqlEntry.sqlId];
                    if (!status) {
                        sqlEntry.status = $scope.SQL_STATUS.NOTHING;
                        continue;
                    }

                    missedRunningSqlCount --;
                    if (status.runningFortime) {
                        sqlEntry.status = $scope.SQL_STATUS.RUNNING_FOR_TIME;
                    }
                    else if (status.running) {
                        sqlEntry.status = $scope.SQL_STATUS.RUNNING;
                    }
                    else {
                        sqlEntry.status = $scope.SQL_STATUS.NOTHING;
                    }

                    // TODO running on datasource

                }

                if (missedRunningSqlCount > 0) {
                    // TODO : fonctionnement à revoir
                    $window.alert(missedRunningSqlCount+" statements are running for this session, but not displayed here."+
                     "To cancel them, yo may cancel all the running statements for the datasource using the general cancel button.");
                }
            }
        );
    }

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

	$scope.sqlRun = function(i, forTime) {
		let sql = $scope.sqlList[i].sqlText;
		if (sql==null || sql=="") {
			return;
		}
		
		if (sql.indexOf(';') >= 0) { // TODO : faire du PEGJS ici
			$scope.splitAndRun(i);
		}
		else {
			$scope.sqlTextRun(i, sql, forTime);
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

	$scope.sqlTextRun = function(i, sql, isForTime) {
		let sqlEntry = $scope.sqlList[i];
		sqlEntry.sqlId = "sqlId_" + $scope.increaseAndGetSqlId();
	    $scope.backupSqlList();

		if (!$rootScope.currentSource) { // TODO : afficher une erreur
			return;
		}

		sqlEntry.canceler = $q.defer();
		sqlEntry.cancelled = false;
		if (isForTime) {
            sqlService.runSqlForTime(sqlEntry, $rootScope.currentSource.name, sql, sqlEntry.sqlId, sqlEntry.timeout, sqlEntry.canceler)
            .then(function(response) {
                    $scope.setSqlResult(i, [], [], false, null);
                    $scope.sqlList[i].rowCount = response.data.nbRows;
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
    		sqlEntry.status = $scope.SQL_STATUS.RUNNING_FOR_TIME;
		}
		else {
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
        }
		$scope.startTimer(sqlEntry, sqlEntry.sqlId);
	}
	
	$scope.startTimer = function(sqlEntry, sqlId) {
		sqlEntry.beginTime = new Date().getTime();
		sqlEntry.endTime = null;
		sqlEntry.duration = " ";

		$scope.timers[sqlId] = $interval(function() {
			if (sqlEntry.endTime) {
				sqlEntry.duration = ((sqlEntry.endTime - sqlEntry.beginTime) / 1000)+"s ("+sqlEntry.rowCount+" rows)";
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
	    let sqlEntry = $scope.sqlList[i];
		sqlEntry.result = result;
		sqlEntry.columns = columns;
		sqlEntry.maxRowsReached = maxRowsReached;
		sqlEntry.messages = messages;
		sqlEntry.rowCount = sqlEntry.result ? sqlEntry.result.length : 0;
	}
	
	$scope.sqlTextKeyPress = function(event, i) {
		if (event.key == 'F9') {
			$scope.sqlRun(i);
		}

		if (i == $scope.sqlList.length-1) {
			$scope.sqlList.push($scope.newEmptySqlEntry());
		}

	}
	
	$scope.sqlStop = function(i) {
		let sql = $scope.sqlList[i];
		
		if (sql.status == $scope.SQL_STATUS.NOTHING) {
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
			if (sql.status != $scope.SQL_STATUS.NOTHING) {
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
		if ($scope.sqlList[i].status != $scope.SQL_STATUS.NOTHING) {
			return;
		}			
			
		if (i==$scope.sqlList.length-1) {
			$scope.sqlList[i] = $scope.newEmptySqlEntry();
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

	$scope.clearSearch = function(event) {
	    $scope.searchSql='';
	    $scope.searchSqlChange();
	    event.stopPropagation();
	}

	$scope.searchSqlChange = function() {
        localStorage.setItem(LOCAL_STORAGE_SQL_SEARCH, $scope.searchSql);
	    let search = ""
	    if ($scope.searchSql) {
	        search = $scope.searchSql.trim();
	    }

	    if (search == "") {
	        // show all
	        for (let i=0; i!=$scope.sqlList.length; i++) {
	            let sqlEntry = $scope.sqlList[i];
	            sqlEntry.searchSqlHide = false;
	        }
	    }
	    else {
	        for (let i=0; i<$scope.sqlList.length-1; i++) {
	            let sqlEntry = $scope.sqlList[i];
	            sqlEntry.searchSqlHide = (sqlEntry.sqlText.indexOf(search) < 0);
	        }
	        if ($scope.sqlList.length > 0) {
	            $scope.sqlList[$scope.sqlList.length-1].searchSqlHide=false;
	        }
	    }
	}

    $scope.restoreSqlList();
});