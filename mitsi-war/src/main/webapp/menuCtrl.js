angular.module('mitsiApp')
    .controller('menuCtrl', function($scope, $rootScope) {

    $rootScope.loggedUser = null;
	
    $scope.closeGeneralError = function() {
    	$rootScope.mitsiGeneralError=null;
    }


});