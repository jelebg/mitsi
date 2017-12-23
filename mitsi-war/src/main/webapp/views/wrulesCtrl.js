angular.module('mitsiApp')
    .controller('wrulesCtrl', function($scope, $rootScope, $timeout) { // TODO : rulesService

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

    $scope.update = function() {
        $scope.updateMode = true;
    }
    $scope.cancel = function() {
        $scope.updateMode = false;
    }

    $scope.addRule = function() {
        let index = $rootScope.rules.length;
        $rootScope.rules.push({});
        let workbenchScroll = document.getElementById("workbenchScroll");

        $timeout(function() {
            workbenchScroll.scrollTo(0, workbenchScroll.scrollHeight);

            let elt = document.getElementById("labelNameCodeMirror_"+index);
            if (elt && elt.firstChild) {
                let codeMirrorInstance = elt.firstChild.CodeMirror;
                if (codeMirrorInstance) {
                    codeMirrorInstance.focus();
                }
            }
        }, 0);
    }

    $scope.removeRule = function(rule, index) {
        $rootScope.rules.splice(index, 1);
    }

});