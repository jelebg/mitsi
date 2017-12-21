angular.module('mitsiApp')
    .controller('wrulesCtrl', function($scope, $rootScope, $q, $interval, $window) { // TODO : rulesService

    // the readOnly attribute cannot be changed at runtime, that's why I have to maintain two editors
    // and display only one at a time
    $scope.editorOptionsReadOnly = {
        "lineWrapping" : true,
        "lineNumbers": false,
        "readOnly" : true,
        "theme"       : "3024-day-custom-ro",
        "mode": "eyeshine",
        "lineWrapping":true
    };

    $scope.editorOptions = {
        "lineWrapping" : true,
        "lineNumbers"  : false,
        "readOnly"     : false,
        "theme"       : "3024-day-custom",
        "mode": "eyeshine",
        "lineWrapping":true
    }; // TODO : utiliser un mode différent pour les commentaires

});