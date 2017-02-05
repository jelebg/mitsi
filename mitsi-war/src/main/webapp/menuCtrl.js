angular.module('mitsiApp')
    .controller('menuAboutPopupCtrl', function($scope, $rootScope, $modalInstance) {
    	
    	$scope.init = function(options) {
    	}
    	
        $scope.closeAbout = function() {
        	$modalInstance.dismiss();
        }
    
});

angular.module('mitsiApp')
    .controller('menuCtrl', function($scope, $rootScope, $modal) {

    $rootScope.loggedUser = null;
	
    $scope.closeGeneralError = function() {
    	$rootScope.mitsiGeneralError=null;
    }
    
    $scope.menuAbout = function() {

		$scope.modalInstance = $modal.open({
		      animation: true,
		      ariaLabelledBy: 'modal-title',
		      ariaDescribedBy: 'modal-body',
		      templateUrl: 'popups/about.mitsi.html',
		      controller: 'menuAboutPopupCtrl'
		    });
	
    }
    

});