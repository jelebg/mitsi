angular.module('mitsiApp')
    .controller('wrulesCtrl', function($scope, $rootScope, $q, $interval, $window) { // TODO : rulesService

    $scope.rules = [
             { "label":"PK",
               "rule": "pkColumn:(column.fullName in primaryKeys.columns)",
               "comment":"Primary Key (constraint(s) : ${pkColumn.constraint.name}, column position in PK : ${pkColumn.position})"
             },
             { "label":"UK",
               "rule": "column.fullName IN uniqueConstraints.columns AND NOT LABELLED 'PK'",
               "comment":"Unique constraint indexed by ${uniqueConstraints.columns[column.fullName].index.owner}.${uniqueConstraints.columns[column.fullName].index.name} (position in index : #${indexes.columns[column.fullName].position})"
             },
             { "label":"FK",
               "rule": "column.fullName IN foreignKeys.columns",
               "comment":"Foreign Key constraint ${foreignKeys.columns[column.fullName].constraint.owner}.${foreignKeys.columns[column.fullName].constraint.name} (column position in FK : #${foreignKeys.columns[column.fullName].position})"
             },
             { "label":"I",
               "rule": "column.fullName IN indexes.columns AND NOT LABELLED 'PK' AND NOT LABELLED 'UK'",
               "rule": "column.fullName IN indexes.columns ",
               "comment":"Indexed by ${indexes.columns[column.fullName].index.owner}.${indexes.columns[column.fullName].index.name} (position in index : #${indexes.columns[column.fullName].position})"
             },
             { "label":"FK??",
               "type":"warning",
               "rule": "prefix:(column.shortName LIKE '(.*)_FK') AND NOT LABELLED 'FK' AND prefix.group1 IN tables.byShortName",
               "candidateFkToTable" : "${source.currentSchema}.${prefix.group1}",
               "comment":"Column ${column.shortName} ending with '_FK', is it a foreign key to ${prefix.group1} ?"
             },
             { "label":"FK?",
               "type":"warning",
                "rule": "column.fullName LIKE '.*_FK' AND NOT LABELLED 'FK' AND NOT LABELLED 'FK??'",
               "comment":"Column name ${column.shortName} ending with '_FK', should it be declared as a Foreign Key ?"
             },
             { "label":"I?", // TODO cette règle est peut-être un peu trop stricte
               "type":"warning",
               "rule": "column.fullName IN foreignKeys.columns AND NOT column.fullName IN indexes.columns",
               "comment":"${column.shortName} is declared as a Foreign Key, but without any index. If the target table is deleted/updated often, an index should be created for this column."
             }/*,
             { "label":"I??",
               "type":"warning",
               "rule": "fk:(column.fullName IN foreignKeys.columns) AND fk.columnsDefinition IN indexes.columnsDefinitions",
               "comment":"${column.shortName} is declared as a Foreign Key (${fk.constraint.name}), but without any index. If the target table is deleted/updated often, an index should be created for this column."
             }*/
        ];


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