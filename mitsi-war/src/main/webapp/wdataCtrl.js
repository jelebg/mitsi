angular.module('mitsiApp')
    .controller('wdataCtrl', function($scope, $rootScope, $timeout, $q, uiGridConstants, sqlService, errorService) {

	$scope.allReadyFetched = 0;
	$scope.nbRowToFetch = 100; 
	$scope.lastOrderByColumns = null;
	
	$scope.sortChanged = function(grid, sortColumns) {
		if(!$rootScope.currentSource) {
			return;
		}
		if(!$rootScope.currentSource.currentObject) {
			return;
		}
		var orderByColumns = [];
		for(var i=0; i!=sortColumns.length; i++) {  
			var col = sortColumns[i];
			orderByColumns.push({"column":col.displayName, "ascending":(col.sort.direction=="asc"?true:false)});
		}
		$scope.lastOrderByColumns = orderByColumns;
		$scope.refresh();
	}
	
	$scope.refresh = function() {
		
		var filters = [];
		for(var i=0; i<$scope.dataGrid.columnDefs.length-1; i++) {
			var elt = document.getElementById("mitsiGridFilter_"+i);
			if(elt && elt.value && elt.value.trim()!="") {
				filters.push({name:$scope.dataGrid.columnDefs[i+1].displayName, filter:elt.value});
			}
		}
		$scope.beginData($rootScope.currentSource, $rootScope.currentSource.currentObject, $scope.lastOrderByColumns, filters, true);
	} 
	
	$scope.initGrid = function() {
		$scope.dataGrid = { 
				data: [],
			    enableFiltering: true,
			    useExternalFiltering: true,
			    useExternalSorting: true,
			    onRegisterApi: function(gridApi){ 
				    gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.getDataDown);
				    gridApi.core.on.sortChanged( $scope, $scope.sortChanged );
				    
			        gridApi.core.on.filterChanged( $scope, function() {
			            var grid = this.grid;
			            
			            for(var i=0; i!=grid.columns.length; i++) {
			            	if(!grid.columns[i].filters) {
			            		continue;
			            	}
			            	for(var j=0; j!=grid.columns[i].filters.length; j++) {
			            		console.log("filter "+i+":"+j+" -> "+grid.columns[i].filters[j].term);
			            	}
			            }
			            
			          });

					$scope.dataGridApi = gridApi;
				},
	            enableFiltering: true,
	            exporterMenuCsv: true,
	            enableGridMenu: true,
	            columnDefs: [
	                 // default
	                 { field: '#',
	                	 width: 50,
	                	 enableFiltering: false
	                 }
	           ]
				
		};
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
		$scope.beginData(source, databaseObject, null, null, false);
	});
	
	$scope.beginData = function(source, databaseObject, orderByColumns, filters, preserveColumns) {
		$scope.lastOrderByColumns = orderByColumns;
		$scope.allReadyFetched = 0;
		sqlService.getData(source.name, databaseObject.id.schema, databaseObject.id.name, 0, $scope.nbRowToFetch, orderByColumns, filters)
		  .then(function(response) {
			  $scope.dataGridApi.core.scrollTo(
					  $scope.dataGrid.data[0],
					  $scope.dataGrid.columnDefs[0]
			  );
			  $scope.dataGrid.data = [];
			  
			  if(!preserveColumns) {
				  $scope.dataGrid.columnDefs = [
		    	                 { field: 'num',
		    	                   displayName:"#",
		    	                   width: 50,
		    	                   enableSorting: false,
		    	                   enableFiltering: false,
		    	                   headerCellTemplate: '<div style="text-align:center;padding-top:3px;" ><button ng-click="grid.appScope.refresh();"><i class="glyphicon glyphicon-refresh"><i/></button></div>', 
		    	                 }
		    	  ];
				  
				  for(var i=0; i!=response.data.columns.length; i++) {
					  $scope.dataGrid.columnDefs.push(
						{   field: 'col'+i,
							displayName: response.data.columns[i].name, 
							width: 200,
					        filterHeaderTemplate: 
					        	'<div style="position:relative;">'+
					        	'<a href="" style="pointer-events: all;position:absolute;right:3px;bottom:2px;z-index:2;" ng-click="grid.appScope.refresh();">'+
					        	'<i class="glyphicon glyphicon-filter" ></i>'+
					        	'</a>'+
					        	'<input id="mitsiGridFilter_'+i+'" style="width:100%;" type="text" />'+
					        	'</div>', 
						}
					  );
				  }
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

		  });
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
		var noMoreData = true;
		sqlService.getData(
				$rootScope.currentSource.name, 
				$rootScope.currentSource.currentObject.id.schema, 
				$rootScope.currentSource.currentObject.id.name, 
				$scope.allReadyFetched, 
				$scope.nbRowToFetch,
				$scope.lastOrderByColumns)
	    .then(function(response) {
		  var t = response.data.results;
		  noMoreData = (t.length==0 || t.length<$scope.nbRowToFetch);
		  for(var i=0; i!=t.length; i++) {
			  var r = {};
			  r["num"] = $scope.dataGrid.data.length+1;
			  for(var j=0; j!=t[i].length; j++) {
				  r["col"+j] = t[i][j];
			  }
			  $scope.dataGrid.data.push(r);
		  }
	      $scope.allReadyFetched = $scope.allReadyFetched+t.length;
	    })
	    .finally(function(error) {
	      $scope.dataGridApi.infiniteScroll.dataLoaded(false, !noMoreData);
	    });
	    return promise.promise;
		
	}
	
	$scope.initGrid();
	if($rootScope.currentSource &&
		$rootScope.currentSource.currentObject) {
		$scope.beginData($rootScope.currentSource, $rootScope.currentSource.currentObject, null, null, false);
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

