angular.module('mitsiApp')
    .controller('wdiffCtrl', function($scope, $rootScope, userService, sourceService) {

    $scope.datasources = [];
    $scope.infoMessage = "";

    $scope.init = function() {
	    userService.getClientStatus()
		  .then(function(response) { // NOSONAR
			  $scope.datasources = response.data.datasources;
        });
	}

    $scope.reset = function() {
        $scope.columnsAAndNotB = null;
        $scope.columnsBAndNotA = null;
    }

	$scope.diff = function() {
        $scope.infoMessage = "running please wait please...";
        $scope.columnsAAndNotB = null;
        $scope.columnsBAndNotA = null;
	    let dsA = null;
	    let dsB = null;

        sourceService
        .getObjects({ "name":$scope.aName }, null)
        .then(function(response) {
            dsA = response.data.databaseObjects;

            // TODO : chain promises
            sourceService
            .getObjects({ "name":$scope.bName }, null)
            .then(function(response) {
                dsB = response.data.databaseObjects;
             $scope.diff2(dsA, dsB);
             $scope.infoMessage = "";
           });

        });
	}

	$scope.diff2 = function(dsA, dsB) {
	    // TODO : indexes
	    // TODO : constraints
	    // TODO : changement de type des colonnes spécifique

	    let columnsA = $scope.getColumnsList(dsA);
	    let columnsB = $scope.getColumnsList(dsB);

        let iA = 0;
        let iB = 0;

        $scope.columnsAAndNotB = [];
        $scope.columnsBAndNotA = [];

        while (iA < columnsA.length || iB < columnsB.length) {
            let colA = iA >= columnsA.length ? null : columnsA[iA];
            let colB = iB >= columnsB.length ? null : columnsB[iB];

            if (colA == null) {
                $scope.columnsBAndNotA.push(colB);
                iB ++;
                continue;
            }

            if (colB == null) {
                $scope.columnsBAndNotA.push(colA);
                iA ++;
                continue;
            }

            if (colA == colB) {
                iA ++;
                iB ++;
                continue;
            }

            if (colA > colB) {
                $scope.columnsBAndNotA.push(colB);
                iB ++;
            }
            else {
                $scope.columnsAAndNotB.push(colA);
                iA ++;
            }
        }
	}

	$scope.getColumnsList = function(ds) {
	    let columns = [];
	    for (let iTable=0; iTable!=ds.length; iTable++) {
	        let table = ds[iTable];

	        for (let iColumn=0; iColumn!=table.columns.length; iColumn++) {
	            let column = table.columns[iColumn];

	            columns.push(table.id.type+"."+table.id.name+"."+column.name+"/"+column.type);
	        }
	    }

	    columns.sort();
	    return columns;
	}

	$scope.init();
});