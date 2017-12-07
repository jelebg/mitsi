angular.module('mitsiApp')
    .controller('wdataCtrl', function($scope, $rootScope, $timeout, $q, uiGridConstants, sqlService, errorService) { // NOSONAR

	$scope.alreadyFetched = 0;
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
		
		$scope.beginData($rootScope.currentSource, $rootScope.currentSource.currentObject, $scope.lastOrderByColumns, $scope.getFilters(), true, false, null);
	} 
	
	$scope.getFilters = function() {
		var filters = [];
		for(var i=0; i<$scope.dataGrid.columnDefs.length-1; i++) {
			var elt = document.getElementById("mitsiGridFilter_"+i);
			if(elt && elt.value && elt.value.trim()!="") {
				filters.push({name:$scope.dataGrid.columnDefs[i+1].displayName, filter:elt.value, type:$scope.dataGrid.columnDefs[i+1].mitsiType});
			}
		}
		return filters;
	}
	
	$scope.initGrid = function() {
		$scope.dataGrid = { 
				data: [],
			    enableFiltering: true,
			    useExternalFiltering: true,
			    useExternalSorting: true,
	            exporterMenuCsv: true,
	            exporterMenuPdf: false,
	            exporterCsvFilename: ($rootScope.currentSource && $rootScope.currentSource.currentObject ?
	            		$rootScope.currentSource.currentObject.id.name :
	            		"download"
	    			)+".csv",
	            exporterAllDataFn: function() {
	        		var defer = $q.defer();
	        		$scope.beginData($rootScope.currentSource, $rootScope.currentSource.currentObject, $scope.lastOrderByColumns, $scope.getFilters(), true, true, defer);
	            	return defer.promise;
	            },
	            enableGridMenu: true,
			    onRegisterApi: function(gridApi){ 
				    gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.getDataDown);
				    gridApi.core.on.sortChanged( $scope, $scope.sortChanged );
				    
			        gridApi.core.on.filterChanged( $scope, function() {
			            var grid = this.grid;
			            
			            for(var i=0; i!=grid.columns.length; i++) {
			            	if(!grid.columns[i].filters) {
			            		continue;
			            	}
			            }
			            
			          });

					$scope.dataGridApi = gridApi;
				},
	            columnDefs: [
	    	                 { field: 'num',
		    	                   displayName:"#",
		    	                   name:"#",
		    	                   width: 50,
		    	                   enableSorting: false,
		    	                   enableFiltering: false,
		    	                   headerCellTemplate: 
		    	                	   '<div class="dataCornerDiv" >'+
		    	                	     '<button ng-click="grid.appScope.refresh();">'+
		    	                	       '<i id="refreshButton" class="glyphicon glyphicon-refresh "></i>'+
		    	                	     '</button><br/>'+
							             '<a id="clearAllfiltersButton" href="" class="dataClearAllFiltersAnchor" style="visibility:hidden;" ng-click="grid.appScope.clearAllFilters(true);">'+
							               '<i class="glyphicon glyphicon-remove dataClearAllFiltersIcon1"></i>'+
							               '<i class="glyphicon glyphicon-filter dataClearAllFiltersIcon2"></i>'+
							             '</a>'+
							           '</div>'
		    	                 }
		    	  ]
				
		};
	}


	/* TODO : unused, delete ? 
	  
	$scope.gridFit = function() {
		var eltList = document.getElementsByClassName("mitsi-fit-viewport-height");
		for(let i=0; i!=eltList.length; i++) {
			const element = eltList[i];
			const windowHW = getWindowHW();
			const elementXY = getAbsoluteXY(element);
			
	        $scope.currentGridHeight = ((windowHW.h-elementXY.y)-3)+"px";
			bug ?? break;
		}

	    $scope.gridRefresh = true;
	    $timeout(function() {
	      $scope.gridRefresh = false;
	      
	      $timeout(function() {
	          $scope.dataGridApi.grid.queueGridRefresh();
	      }, 0);
	      
     
	    }, 0);

	} */
	
	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED, function (event, source, databaseObject) { // NOSONAR
		$scope.dataGrid.exporterCsvFilename = databaseObject.id.name+".csv";
		$scope.beginData(source, databaseObject, null, null, false, false, null);
	});
	
	$scope.$on(EVENT_DATA_GRID_REFRESH, function (event) { // NOSONAR
        $scope.dataGridApi.core.handleWindowResize()
	});

	
	$scope.updateClearAllFiltersVisibility = function(filters) {
		var visib = false;
		if(filters && filters.length > 0) {
			visib = true;
		}
		var elt = document.getElementById("clearAllfiltersButton");
		if(!elt) {
			return;
		}
		
		elt.style.visibility = visib ? "visible" : "hidden";
	}

	$scope.loadingBegins = function() {
		var elt = document.getElementById("refreshButton");
		if(!elt) {
			return;
		}
		elt.classList.add('fast-right-spinner');
	}
	
	$scope.loadingEnds = function() {
		var elt = document.getElementById("refreshButton");
		if(!elt) {
			return;
		}
		elt.classList.remove('fast-right-spinner');
	}
	
	$scope.beginData = function(source, databaseObject, orderByColumns, filters, preserveColumns, maxServerRows, endPromise) {
		$scope.updateClearAllFiltersVisibility(filters);
		
		var nbRow = maxServerRows ? 0 : $scope.nbRowToFetch;
		
		$scope.lastOrderByColumns = orderByColumns;
		$scope.alreadyFetched = 0;
		$scope.loadingBegins();
		sqlService.getData(source.name, databaseObject.id.schema, databaseObject.id.name, 0, nbRow, orderByColumns, filters)
		  .then(function(response) {
              if ($scope.dataGridApi) { // on init, dataGridApi may not be registered yet
                  $scope.dataGridApi.core.scrollTo(
                          $scope.dataGrid.data[0],
                          $scope.dataGrid.columnDefs[0]
                  );
              }
			  $scope.dataGrid.data = [];
			  
			  if(!preserveColumns) {
				  $scope.dataGrid.columnDefs = $scope.dataGrid.columnDefs.slice(0, 1);
				  $scope.clearAllFilters(false);
				  
				  for(var i=0; i!=response.data.columns.length; i++) {
					  $scope.dataGrid.columnDefs.push(
						{   field: 'col'+i,
							displayName: response.data.columns[i].name, 
							name: response.data.columns[i].name, 
							width: 200,
							mitsiType: response.data.columns[i].type, 
					        filterHeaderTemplate: 
					        	'<div style="position:relative;">'+
					        	'<a href="" class="dataColFilter" ng-click="grid.appScope.refresh();">'+
					        	'<i class="glyphicon glyphicon-filter" ></i>'+
					        	'</a>'+
					        	'<a href="" class="dataColFilterClear" ng-click="grid.appScope.clearFilter('+i+');">'+
					        	'<i class="glyphicon glyphicon-remove" ></i>'+
					        	'</a>'+
					        	'<input id="mitsiGridFilter_'+i+'" class="dataColFilterText" type="text" ng-keypress="grid.appScope.filterKeyPressed($event, \''+response.data.columns[i].type+'\')" />'+
					        	'</div>', 
						}
					  );
				  }
			  }
			  
			  const t = response.data.results;
			  for(let i=0; i!=t.length; i++) {
				  const r = {};
				  r["num"] = $scope.dataGrid.data.length+1;
				  for(var j=0; j!=t[i].length; j++) {
					  r["col"+j] = t[i][j];
				  }
				  $scope.dataGrid.data.push(r);
			  }
		      $scope.alreadyFetched = response.data.results.length;
		      
		      if(response.data.maxRowsReached) {
		    	  errorService.showGeneralError("maximum server rows has been reached");
		      }
		      
		      if(endPromise) {
		    	  endPromise.resolve();
		      }

		  }, function(error) {
		   	  errorService.showGeneralError("internal error");
		   	  
			  if(endPromise) {
				  endPromise.reject(error);
			  }
		  })
		  .finally(function() {
			   $scope.loadingEnds();
		  });

	};
	
	$scope.refreshOnEnter = function(event) {
		if(event.keyCode == 13) {
			$scope.refresh();
		}
	}
	
	$scope.filterKeyPressed = function(event, filterFormat) {
		var keyCode = event.keyCode;
		var charCode = event.charCode;
		if(keyCode == 13) {
			$scope.refresh();
			return;
		}
		
		if(filterFormat === "integer" &&
			(charCode > 31 && (charCode < 48 || charCode > 57))) {
				event.preventDefault();
			return;
		}
	}
	
	$scope.clearFilter = function(filterIndex) {
		document.getElementById('mitsiGridFilter_'+filterIndex).value = "";
		$scope.refresh();
	}
	
	$scope.clearAllFilters = function(andRefresh) {
		for(var i=0; i<$scope.dataGrid.columnDefs.length-1; i++) {
			document.getElementById('mitsiGridFilter_'+i).value = "";
		}
		if(andRefresh) {
			$scope.refresh();
		}
	}
	
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
				$scope.alreadyFetched, 
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
	      $scope.alreadyFetched = $scope.alreadyFetched+t.length;
	    })
	    .finally(function(error) { // NOSONAR
	      $scope.dataGridApi.infiniteScroll.dataLoaded(false, !noMoreData);
	    });
	    return promise.promise;
		
	}
	
	$scope.initGrid();
	if($rootScope.currentSource &&
		$rootScope.currentSource.currentObject) {
		$scope.beginData($rootScope.currentSource, $rootScope.currentSource.currentObject, null, null, false, false, null);
	}

	$scope.gridRefresh = false;
    $timeout(function() {
    	// TODO : reste un bug : si on agrandit la fenetre, le nombre de lignes affichées n'évolue pas tant qu'on ne scrolle pas
    	if($scope.dataGridApi && $scope.dataGridApi.grid) {
    		$scope.dataGridApi.grid.queueGridRefresh();
    	}
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

