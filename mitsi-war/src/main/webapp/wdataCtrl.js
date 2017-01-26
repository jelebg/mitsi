angular.module('mitsiApp')
    .controller('wdataCtrl', function($scope, $rootScope, $timeout, $q, uiGridConstants, sqlService) {

	$scope.enableFilter = false;
	$scope.allReadyFetched = 0;
	$scope.nbRowToFetch = 100; 
	

	
	$scope.initGrid = function() {
		$scope.dataGrid = { 
				data: [],
				onRegisterApi: function(gridApi){ 
				    gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.getDataDown);
					$scope.dataGridApi = gridApi;
				},
	            enableFiltering: $scope.enableFilter,
	            exporterMenuCsv: true,
	            enableGridMenu: true,
	            columnDefs: [
	                 // default
	                 { field: 'num',
	                	 width: 50
	                 },
	                 { field: 'col1',
	                	 width: 150
	                 },
	                 // pre-populated search field
	                 { field: 'col2', 
	                   filter: {
	                     term: '1',
	                     type: uiGridConstants.filter.SELECT,
	                     selectOptions: [ { value: '1', label: 'male' }, { value: '2', label: 'female' }, { value: '3', label: 'unknown'}, { value: '4', label: 'not stated' }, { value: '5', label: 'a really long value that extends things' } ]
	                   },
	                   width: 150
	                   /*,cellFilter: 'mapGender', headerCellClass: $scope.highlightFilteredHeader*/
	                 },
	                 // no filter input
	                 { field: 'col3', enableFiltering: false, 
	                   filter: {
	                     noTerm: true,
	                     condition: function(searchTerm, cellValue) {
	                       return cellValue.match(/a/);
	                     }
	                    },
	                   width: 150
	                 }
	           ]
				
		};
	}


	$scope.toggleFilter = function() {
		$scope.enableFilter = ! $scope.enableFilter;
        $scope.dataGridApi.grid.queueGridRefresh();

	}
	
	$scope.gridFit = function() {
		var eltList = document.getElementsByClassName("mitsi-fit-viewport-height");
		for(var i=0; i!=eltList.length; i++) {
			var element = eltList[i];
			
			var windowHW = getWindowHW();
			
			var elementXY = getAbsoluteXY(element);
			//angular.element(element).css('height', (windowHW.h-elementXY.y)+"px");
			//angular.element(element.childNodes[0]).css('height', (windowHW.h-elementXY.y)+"px");
			//element.style.height = (windowHW.h-elementXY.y)+"px";
			//var h = (windowHW.h-elementXY.y)+"px";
			//$scope.dataGrid.refresh();
			

		      $scope.currentGridHeight = ((windowHW.h-elementXY.y)-3)+"px";
			break;
		}

        //$scope.dataGridApi.grid.queueGridRefresh();
        //$scope.dataGridApi.grid.queueRefresh();

	    $scope.gridRefresh = true;
	    $timeout(function() {
	      $scope.gridRefresh = false;
	      //$scope.dataGridApi.grid.queueGridRefresh();
	      
	      $timeout(function() {
	          $scope.dataGridApi.grid.queueGridRefresh();
	    	  //$scope.dataGridApi.grid.refreshRows();
	      }, 0);
	      
     
	    }, 0);

	}
	
	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED, function (event, source, databaseObject) {
		$scope.beginData(source, databaseObject);
	});
	
	$scope.beginData = function(source, databaseObject) {
		$scope.allReadyFetched = 0;
		sqlService.getData(source.name, databaseObject.id.schema, databaseObject.id.name, 0, $scope.nbRowToFetch)
		  .then(function(response) {
			  $scope.dataGridApi.core.scrollTo(
					  $scope.dataGrid.data[0],
					  $scope.dataGrid.columnDefs[0]
			  );
			  $scope.dataGrid.data = [];
			  
			  $scope.dataGrid.columnDefs = [
	    	                 { field: 'num',
	    	                	 width: 50
	    	                 }
	    	  ];
			  
			  for(var i=0; i!=response.data.columns.length; i++) {
				  $scope.dataGrid.columnDefs.push(
					{   field: 'col'+i,
						displayName: response.data.columns[i].name, 
						width: 200 }
				  );
			  }

			  
			  var t = response.data.results;
			  for(var i=0; i!=t.length; i++) {
				  var r = {};
				  r["num"] = $scope.dataGrid.data.length+1;
				  for(var j=0; j!=t[i].length; j++) {
					  r["col"+j] = t[i][j];
				  }
				  $scope.dataGrid.data.push(r);
			  }
		      $scope.allReadyFetched = response.data.results.length;

		  }, 
		  errorService.getGenericHttpErrorCallback());
	};
	
	$scope.getDataDown = function() {

		if(!$rootScope.currentSource) {
			return;
		}
		if(!$rootScope.currentSource.currentObject) {
			return;
		}
		
		$rootScope.currentSource.currentObject.id.schema
	    var promise = $q.defer();
		sqlService.getData(
				$rootScope.currentSource.name, 
				$rootScope.currentSource.currentObject.id.schema, 
				$rootScope.currentSource.currentObject.id.name, 
				$scope.allReadyFetched, 
				$scope.nbRowToFetch)
	    .success(function(response) {
	    	
		  var t = response.results;
		  var noMoreData = (t.length==0 || t.length<$scope.nbRowToFetch);
		  for(var i=0; i!=t.length; i++) {
			  var r = {};
			  r["num"] = $scope.dataGrid.data.length+1;
			  for(var j=0; j!=t[i].length; j++) {
				  r["col"+j] = t[i][j];
			  }
			  $scope.dataGrid.data.push(r);
		  }
	      $scope.allReadyFetched = $scope.allReadyFetched+t.length;
          $scope.dataGridApi.infiniteScroll.dataLoaded(false, !noMoreData);
          promise.resolve();
	    })
	    .error(function(error) {
	      $scope.dataGridApi.infiniteScroll.dataLoaded();
	      promise.reject();
	    });
	    return promise.promise;
		
	}
	
	$scope.initGrid();
	if($rootScope.currentSource &&
		$rootScope.currentSource.currentObject) {
		$scope.beginData($rootScope.currentSource, $rootScope.currentSource.currentObject);
	}

	$scope.gridRefresh = false;
	$scope.currentGridHeight = "300px";
    $timeout(function() {
    	// TODO : reste un bug : si on agrandit la fenetre, le nombre de lignes affichées n'évolue pas tant qu'on ne scrolle pas
        $scope.dataGridApi.grid.queueGridRefresh();
  	  //$scope.dataGridApi.grid.refreshRows();
    }, 0);
});

/* recuperer la hauteur de la fenetre */
function getWindowHW() {
	var myHeight = 0;
	if (typeof (window.innerHeight) == 'number') {
		myHeight = window.innerHeight;
	} else if (document.documentElement
			&& document.documentElement.clientHeight) {
		myHeight = document.documentElement.clientHeight;
	} else if (document.body && document.body.clientHeight) {
		myHeight = document.body.clientHeight;
	}

	var myWidth = 0;
	if (typeof (window.innerWidth) == 'number') {
		myWidth = window.innerWidth;
	} else if (document.documentElement && document.documentElement.clientWidth) {
		myWidth = document.documentElement.clientWidth;
	} else if (document.body && document.body.clientWidth) {
		myWidth = document.body.clientWidth;
	}

	return {
		h : myHeight,
		w : myWidth
	};
}

