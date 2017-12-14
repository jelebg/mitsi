// depends on the source of sourceCtrl

function computeColumnCollections(source, collections) {
    // TODO : gérer la case-insensitivity en ne stockant que des majuscules ?
    let fkColumnNames = {};
    let pkColumnNames = {};
    let ukColumnNames = {};
    let indexedColumnNames = {};
    let indexedColumnsDefinitions = {};
    let tablesByShortName  = {};
    let tablesByFullName   = {};
    collections["foreignKeys"] = {
            "columns" : fkColumnNames
    }
    collections["primaryKeys"] = {
            "columns" : pkColumnNames
    }
    collections["uniqueContraints"] = {
            "columns" : ukColumnNames
    }
    collections["index"] = {
            "columns" : indexedColumnNames,
            "columnsDefinitions" : indexedColumnsDefinitions // contains all col1 col1,col2 col1,col2,col3
    }
    collections["tables"] = {
            "byShortName" : tablesByShortName,
            "byFullName"  : tablesByFullName
    }

    for(let iObj=0; iObj!=source.objects.length; iObj++) {
        let obj = source.objects[iObj];

        let table = {
            "shortName" : obj.id.name,
            "fullName"  : obj.id.schema + "." + obj.id.name
        };
        nullSavePushToArrayInCollection(tablesByShortName, table.shortName, table);
        nullSavePushToArrayInCollection(tablesByFullName,  table.fullName,  table);

        if(!obj.columns) {
            continue;
        }

        if(obj.indexes) {
            for(let i=0; i!=obj.indexes.length; i++) {
                let index = obj.indexes[i];
                if(!index.columns || index.columns=="") {
                    continue;
                }

                let cols = index.columns.split(",");
                for(let c=0; c!=cols.length; c++) {
                    let columnName = cols[c];
                    let columnFullName = source.currentSchemaName+"."+obj.id.name+"."+columnName;
                    let columnsDefinition = (c==cols.length-1) ? index.columns : cols.slice(0, c+1).join(",");
                    let indexCollectionEntry = {"index":index, "position":c+1, "columnsDefinition":index.columns};

                    // first columnsDefinition
                    let currentDefs = indexedColumnsDefinitions[columnsDefinition];
                    if (!currentDefs) {
                        currentDefs = [];
                        indexedColumnsDefinitions[columnsDefinition] = currentDefs;
                    }
                    currentDefs.push(indexCollectionEntry);

                    // then column only
                    let current = indexedColumnNames[columnFullName];
                    if (!current) {
                        current = [];
                        indexedColumnNames[columnFullName] = current;
                    }
                    current.push(indexCollectionEntry);

                    if (index.uniqueness == 't') {
                        let ukCurrent = ukColumnNames[columnFullName];
                        if (!ukCurrent) {
                            ukCurrent = [];
                            ukColumnNames[columnFullName] = ukCurrent;
                        }
                        ukCurrent.push(indexCollectionEntry);
                    }
                }
            }
        }

        if(obj.constraints) {
            for(let i=0; i!=obj.constraints.length; i++) {
                let constraint = obj.constraints[i];
                if(!constraint.columns || constraint.columns=="") {
                    continue;
                }

                if(constraint.type !== "R" && constraint.type !== "P") {
                    continue;
                }

                let cols = constraint.columns.split(",");
                for(let c=0; c!=cols.length; c++) {
                    let columnName = cols[c];
                    let columnFullName = source.currentSchemaName+"."+obj.id.name+"."+columnName;

                    let current = null;
                    let currentColDef = null;
                    if(constraint.type == "R") {
                        current = fkColumnNames[columnFullName];
                        if(!current) {
                            current = [];
                            fkColumnNames[columnFullName] = current;
                        }
                    }
                    else {
                        current = pkColumnNames[columnFullName];
                        if(!current) {
                            current = [];
                            pkColumnNames[columnFullName] = current;
                        }
                    }
                    current.push({"constraint":constraint, "position":c+1, "columnsDefinition":constraint.columns});
                }
            }
        }
    }
}

function computeColumnLabels(source, rules) {
    let labelsFilters = {};
    source.labelsFilters = labelsFilters;
    source.labelFilterInclude = {};
    source.labelFilterExclude = {};

    let variables = {
        "variables" : {
            "source": {
                "name"          : source.name,
                "provider"      : source.dbProvider,
                "currentSchema" : source.currentSchemaName
            }
        },
        "collections" : {},
        "customVariables" : {},
        "customArrays" : {}
    };
    computeColumnCollections(source, variables.collections);

    for(let i=0; i!=rules.length; i++) {
        let rule = rules[i];
        rule.parsedRule = peg.parse(rule.rule.trim());
        if (rule.comment) {
            rule.commentParts = getVariableStringParts(pegVariables, rule.comment);
        }
        if (rule.candidateFkToTable) {
            rule.candidateFkToTableParts = getVariableStringParts(pegVariables, rule.candidateFkToTable);
        }

        if (rule.label) {
            if (labelsFilters[rule.label]) {
                if (labelsFilters[rule.label] && rule.labelWarning) {
                    // if a label is defined in two rules as warning and normal, then consider it as warning
                    labelsFilters[rule.label].type = "warning";
                }
            }
            else {
                labelsFilters[rule.label] = { "label":rule.label, "status":0, "type":"normal", "count":0 };
            }
        }
        if (rule.labelWarning) {
            if (labelsFilters[rule.labelWarning]) {
                // if a label is defined in two rules as warning and normal, then consider it as warning
                // so no need to check here
            }
            else {
                labelsFilters[rule.labelWarning] = { "label":rule.labelWarning, "status":0, "type":"warning", "count":0 };
            }
        }
    }

    for(let iObj=0; iObj!=source.objects.length; iObj++) {
        let obj = source.objects[iObj];

        if(!obj.columns) {
            continue;
        }

        variables.variables["table"] = {
                "type"     : obj.id.type,
                "fullName" : source.currentSchemaName+"."+obj.id.name,
                "shortName": obj.id.name
        }

        obj.columnsLabels = {};

        for(let i=0; i!=obj.columns.length; i++) {
            let column = obj.columns[i];

            variables.variables["column"] = {
                    "fullName" : source.currentSchemaName+"."+obj.id.name+"."+column.name,
                    "shortName": column.name
            };

            let labels = {
                    "normal"   : [],
                    "warning"  : []
            }
            let labelsComments = [ ];
            let candidateFks = [];

            computeRulesForSource(rules, variables, labels, labelsComments, candidateFks);

            for (let j=0; j!=labels.normal.length; j++) {
                let label = labels.normal[j];
                labelsFilters[label].count ++;
            }
            for (let j=0; j!=labels.warning.length; j++) {
                let label = labels.warning[j];
                labelsFilters[label].count ++;
            }

            column.labels = labels.normal.concat(labels.warning);
            column.labelsString = labels.normal.join(",");
            column.labelsWarningString = labels.warning.join(",");
            column.labelsComments = labelsComments;
            // TODO : rajouter le currentSchema aux tables des candidateFks sauf si deja dans le nom
            column.candidateFks = candidateFks;

            for(let j=0; j!=column.labels.length; j++) {
                let label = column.labels[j];
                obj.columnsLabels[label] = true;
            }
        }
    }
}

function computeRulesForSource(rules, variables, labels, labelsComments, candidateFks) {
    for(let iRule=0; iRule!=rules.length; iRule	++) {
        let rule = rules[iRule];
        let parsedRule = rule.parsedRule;

        variables.customArrays = {};
        variables.customVariables = {};
        let result = ruleCompute(parsedRule, variables, labels);
        if(result) {
            if(rule.label) {
                labels.normal.push(rule.label);
            }

            if(rule.labelWarning) {
                labels.warning.push(rule.labelWarning);
            }

            let comment = null;
            if(rule.commentParts) {
                comment = computeVariableString(rule.commentParts, variables);
                labelsComments.push(comment);
            }

            let candidateFkElement = null;
            if(rule.candidateFkToTableParts) {
                let candidateFk = computeVariableString(rule.candidateFkToTableParts, variables);
                candidateFkElement = {
                    "targetTableName" : candidateFk,
                }
                candidateFks.push(candidateFkElement);
            }

            if (candidateFkElement && comment) {
                candidateFkElement["comment"] = comment;
            }
        }
    }
}
