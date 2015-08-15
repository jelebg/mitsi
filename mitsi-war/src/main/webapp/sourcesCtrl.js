angular.module('mitsiApp')
    .controller('sourcesCtrl', function($scope, $rootScope, $http, userService, sourceService) {

	$scope.mya = true;
	$scope.tutu = "sources";
	$scope.datasources = [];

	
	$scope.init = function() {
		if($scope.datasources.length > 0) {
			return;
		}
		
		userService.getClientStatus()
		  .then(function(response) {
			  $scope.datasources = response.data.datasources;

			  for(var i=0; i!=$scope.datasources.length; i++) {
				  if($scope.datasources[i].connected) {
				  	$rootScope.$broadcast('DatasourceConnected', $scope.datasources[i]);
				  }
			  }

		  }, function(errorMessage) {
		      // called asynchronously if an error occurs
		      // or server returns response with an error status.
			  console.warn( errorMessage );
			  alert( errorMessage );
		  });
	};
	
	$scope.connect = function(source) {
		//alert(source.name);
		//source.connected = !source.connected; 
		if(!source.connected) {
			sourceService.connectDatasource(source.name)
			  .then(function(response) {
				  source.connected = response.data.connected;
				  
				  $rootScope.$broadcast('DatasourceConnected', source);
				  //$scope.refresh(source);
			  }, function(errorMessage) {
			      // called asynchronously if an error occurs
			      // or server returns response with an error status.
				  source.connected = false;
				  console.warn( errorMessage );
				  alert( errorMessage );
			  });
		}
		else {
			sourceService.disconnectDatasource(source.name)
			  .then(function(response) {
				  source.connected = !response.data.disconnected;
			  }, function(errorMessage) {
			      // called asynchronously if an error occurs
			      // or server returns response with an error status.
				  source.connected = false;
				  console.warn( errorMessage );
				  alert( errorMessage );
			  });
		}
	}

	$scope.refresh = function(source) {
		sourceService.getObjects(source.name, null)
		  .then(function(response) {
			  source.objects = response.data.databaseObjects;
			  // TODO : response.data.schemas
			  
		  }, function(errorMessage) {
		      // called asynchronously if an error occurs
		      // or server returns response with an error status.
			  console.warn( errorMessage );
			  alert( errorMessage );
		  });
	}
	
	$scope.isSourceExcludedByFilter = function(source) {
		if(!$scope.searchSource) {
			return false;
		}
		
		var filter = $scope.searchSource.trim().toLowerCase();
		if(filter.length == 0) {
			return false;
		}
		var name = source.name.toLowerCase();
		var tags = source.tags.join(" ");
		return name.indexOf( filter ) === -1 && tags.indexOf( filter ) === -1;
	}
	
	$scope.isObjectExcludedByFilter = function(objectName, source) {
		if(!source.searchObject) {
			return false;
		}
		
		var filter = source.searchObject.trim().toLowerCase();
		if(filter.length == 0) {
			return false;
		}
		var name = objectName.toLowerCase();
		return name.indexOf( filter ) === -1;

	}
	
	$scope.$on('DatasourceConnected', function (event, source) {
	    $scope.refresh(source);
	});
	
	$scope.init();

});