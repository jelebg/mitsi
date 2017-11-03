angular.module('mitsiApp')
    .controller('workbenchtabsCtrl', function($scope, $state) {

$scope.isMitsiExperimentalScope = function() {
    return isMitsiExperimental();
}
	
});