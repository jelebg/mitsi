angular.module('mitsiApp')
    .controller('wdataCtrl', function($scope, $timeout, $q, uiGridConstants, sqlService) {

	$scope.tutu = "wdata";
	$scope.enableFilter = false;
	var nbRowToFetch = 100; // TODO
	
	//$scope.mesdatas = [
	                  // {"col1":"tutu", "col2":"tata", "col3":"toto"},
	                  // {"col1":"abc", "col2":"def", "col3":"ghi"}
	//];
/*for(var i=0; i!=100; i++) {
		$scope.mesdatas.push({ "col1":""+i, "col2":""+i, "col3":""+i })
		
	}*/
	
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
	            //infiniteScrollDown: true,
	            //gridMenuTitleFilter: fakeI18n,
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
	$scope.initGrid();

	$scope.gridRefresh = false;
	$scope.currentGridHeight = "300px";
    $timeout(function() {
    	// TODO : reste un bug : si on agrandit la fenetre, le nombre de lignes affichées n'évolue pas tant qu'on ne scrolle pas
        $scope.dataGridApi.grid.queueGridRefresh();
  	  //$scope.dataGridApi.grid.refreshRows();
    }, 0);

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
	
	
     /*$scope.getTableStyle = function() {
         return {
             height: $scope.currentGridHeight,
             width: "200px"
         };
      };*/


	$scope.$on(EVENT_DATABASE_OBJECT_SELECTED, function (event, source, databaseObject) {
		//alert(source.name + " - " + databaseObject.id.name);
		$scope.dataGridSourceName = source.name;
		sqlService.beginTable(source.name, nbRowToFetch, databaseObject.id.schema, databaseObject.id.name)
		  .then(function(response) {
			  //alert(response);
			  //response.data.columns
			  //$scope.mesdatas = [];
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

			  
			  //$scope.initGrid();
			  var t = response.data.results;
			  for(var i=0; i!=t.length; i++) {
				  var r = {};
				  r["num"] = $scope.dataGrid.data.length+1;
				  for(var j=0; j!=t[i].length; j++) {
					  r["col"+j] = t[i][j];
				  }
				  //$scope.mesdatas.push(r);
				  $scope.dataGrid.data.push(r);
			  }
				
			  /*if($scope.dataGrid.data.length > 0) {
				  $scope.dataGridApi.core.scrollTo(
						  $scope.dataGrid.data[0],
						  $scope.dataGrid.columnDefs[0]
				  );
			  }*/

				/*$scope.gridRefresh = true;
			  $timeout(function() {
					$scope.gridRefresh = false;
			    	$scope.dataGridApi.grid.queueGridRefresh();
			  });*/
		  }, function(errorMessage) {
		      // called asynchronously if an error occurs
		      // or server returns response with an error status.
			  console.warn( errorMessage );
			  alert( errorMessage );
		  });
	});
	
	$scope.getDataDown = function() {
		if(!$scope.dataGridSourceName) {
			return;
		}
		
	    var promise = $q.defer();
	    sqlService.fetch($scope.dataGridSourceName, nbRowToFetch)
	    .success(function(response) {
	    	
	      //$scope.dataGridApi.infiniteScroll.saveScrollPercentage();
		  var t = response.results;
		  var noMoreData = (t.length==0 || t.length<nbRowToFetch);
		  for(var i=0; i!=t.length; i++) {
			  var r = {};
			  r["num"] = $scope.dataGrid.data.length+1;
			  for(var j=0; j!=t[i].length; j++) {
				  r["col"+j] = t[i][j];
			  }
			  //$scope.mesdatas.push(r);
			  $scope.dataGrid.data.push(r);
		  }
          $scope.dataGridApi.infiniteScroll.dataLoaded(false, !noMoreData);
          promise.resolve();
	    })
	    .error(function(error) {
	      $scope.gridApi.infiniteScroll.dataLoaded();
	      promise.reject();
	    });
	    return promise.promise;
		
	}
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

/* recupérer la position absolue d'un div */
function getAbsoluteXY(element) {
	var lx = 0, ly = 0;
	for (; element != null; lx += element.offsetLeft, ly += element.offsetTop, element = element.offsetParent) {
	}
	return {
		x : lx,
		y : ly
	};
}