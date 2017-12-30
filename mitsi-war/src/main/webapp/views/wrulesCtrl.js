angular.module('mitsiApp')
    .controller('wrulesCtrl', function($scope, $rootScope, $timeout, userService) { // TODO : rulesService

    $scope.updateMode = false;

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
        $scope.rulesCopy.push({});
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
        $scope.rulesCopy.splice(index, 1);
    }

    $scope.saveRules = function() {
        $rootScope.rules = JSON.parse(JSON.stringify($scope.rulesCopy));
        $rootScope.$broadcast(EVENT_RULES_UPDATED);
         $scope.updateMode = false;
   }

    $scope.cancel = function() {
        $scope.init();
        $scope.updateMode = false;
    }

    $scope.moveRule = function(from, to) {
        let removed = $scope.rulesCopy.splice(from, 1)[0];
        $scope.rulesCopy.splice(to, 0, removed);
    }

    $scope.resetRules = function() {
        userService.getRules().then(function(response) {
            $rootScope.rules = response.data.rules;
            $scope.init();
            $scope.updateMode = false;
        });
    }

    $scope.init = function() {
        // clone the rules before modifying them
        $scope.rulesCopy = JSON.parse(JSON.stringify($rootScope.rules));
    }

    $scope.init();
});