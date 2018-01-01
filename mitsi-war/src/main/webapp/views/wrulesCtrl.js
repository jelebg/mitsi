angular.module('mitsiApp')
.controller('wrulesVariablesCtrl', function($scope, $modalInstance, variables) {

    $scope.closeOptionsDialog = function() {
        $modalInstance.dismiss();
    }


    // TODO : mettre dans un JS a part pour pouvoir faire un TU
    $scope.variablesTransform = function(variables) {
        let tree = {};
        $scope.mergeNoLeafs(tree, variables.variables  , 0, 2);
        $scope.mergeNoLeafs(tree, variables.collections, 0, 2);

        console.log(JSON.stringify(tree, null, 2));
        console.log(JSON.stringify(variables, null, 2));

        let list = [];
        $scope.appendToListWithIndent(list, tree, 0);

        return list;
    }

    $scope.appendToListWithIndent = function(list, tree, level) {
        for (k in tree) {
            list.push({"level":level, "name":k});

            $scope.appendToListWithIndent(list, tree[k], level+1);
        }
    }

    $scope.mergeNoLeafs = function(destTree, sourceTree, level, maxLevel) {
        if (level >= maxLevel) {
            return;
        }
        if (typeof sourceTree !== 'object') {
            return;
        }

        for (k in sourceTree) {
            let d = destTree[k];
            if (!d) {
                d = {};
                destTree[k] = d;
            }

            $scope.mergeNoLeafs(d, sourceTree[k], level+1, maxLevel);
        }
    }

    $scope.variables = $scope.variablesTransform(variables);

})
.controller('wrulesCtrl', function($scope, $rootScope, $timeout, $modal, userService) { // TODO : rulesService

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
        saveRulesInLocalStorage($rootScope.rules);
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
        removeRulesFromLocalStorage();
        $scope.init();
    }

    $scope.displayCollections = function() {
          let fakeDatasource = {
             "currentSchemaName" : "FAKE",
             "objects":[
                {
                   "id":{
                      "type":"table",
                      "schema":"FAKE",
                      "name":"fake"
                   },
                   "secondaryType":"TABLE",
                   "description":"",
                   "columns":[
                      {
                         "name":"FAKE",
                         "type":"4",
                         "length":0,
                         "description":""
                      }
                   ],
                   "indexes":[
                      {
                         "owner":"FAKE",
                         "tableName":"fake",
                         "name":"fake",
                         "type":"",
                         "uniqueness":"t",
                         "columns":"FAKE"
                      }
                   ],
                   "constraints":[
                      {
                         "owner":"FAKE",
                         "name":"fake",
                         "tableName":"fake",
                         "type":"P",
                         "columns":"FAKE"
                      }
                   ],
                   "partitionned":false
                }
             ]
          };

        let variables = computeColumnLabels(fakeDatasource, $scope.rulesCopy, true);
        //console.log("variables : "+JSON.stringify(variables, null, 2));

        const modalInstance = $modal.open({
              "animation": true,
              "ariaLabelledBy": 'modal-title',
              "ariaDescribedBy": 'modal-body',
              "templateUrl": 'popups/rulesVariables.inline.html',
              "controller": 'wrulesVariablesCtrl',
              "resolve": {
                  "variables": function () {
                    return variables;
                  }
              }
            });

        modalInstance.result.then(function () {
          // nothing
        }, function () {
          // nothing
        });

    }

    $scope.init = function() {
        let savedRules = getRulesFromLocalStorage();
        if (!savedRules) {
            userService.getRules().then(function(response) {
                $rootScope.rules = response.data.rules;
                $scope.rulesCopy = JSON.parse(JSON.stringify($rootScope.rules));
                $scope.updateMode = false;
                $rootScope.$broadcast(EVENT_RULES_UPDATED);
            });
        }
        else {
            // clone the rules before modifying them
            $scope.rulesCopy = JSON.parse(JSON.stringify($rootScope.rules));
        }
    }

    $scope.init();
});