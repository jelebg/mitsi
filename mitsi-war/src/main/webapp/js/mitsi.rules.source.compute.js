// depends on the source of sourceCtrl

function removeRulesFromLocalStorage() {
    localStorage.removeItem("rules");
}

function getRulesFromLocalStorage() {
    let savedRules = localStorage.getItem("rules");
    if (savedRules) {
        return JSON.parse(savedRules);
    }

    return null;
}

function saveRulesInLocalStorage(rules) {
    localStorage.setItem("rules", JSON.stringify(rules));
}


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
    collections["uniqueConstraints"] = {
            "columns" : ukColumnNames
    }
    collections["indexes"] = {
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

function initLabelsWorkingContext() {
    return {
        labels : {},
        labelsComments : [ ],
        candidateFks : []
    }
}

function getLabelsContext(labelsWorkingContext) {
    // TODO : rajouter le currentSchema aux tables des candidateFks sauf si deja dans le nom
    let labelsConcat = [];
    let labelsStringByType = {};

    for (let t in labelsWorkingContext.labels) {
        let byType = labelsWorkingContext.labels[t];

        labelsConcat = labelsConcat.concat(byType.labels);
        labelsStringByType[t] = byType.displays.join(",");
    }

    return {
        "labels"              : labelsConcat,
        "labelsStringByType"  : labelsStringByType,
        "labelsComments"      : labelsWorkingContext.labelsComments,
        "candidateFks"        : labelsWorkingContext.candidateFks
    };
}

function updateLabelsCount(labels, columnsLabels, labelsFilters) {
    for (let i=0; i!=labels.length; i++) {
        let label = labels[i];
        labelsFilters[label].count ++;
        columnsLabels[label] = true;
    }
}

function computeColumnLabels(source, rules, returnVariables) {
    if (!source.objects) {
        return;
    }

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

        labelsFilters[rule.label] = {
            "label":rule.label,
            "labelDisplay":getLabelDisplay(rule),
            "labelComment":rule.labelComment,
            "status":0,
            "type":getRuleType(rule),
            "count":0
        };
    }

    for(let iObj=0; iObj!=source.objects.length; iObj++) {
        let obj = source.objects[iObj];

        if(!obj.columns) {
            continue;
        }

        variables.variables["table"] = {
                "type"     : obj.id.type,
                "fullName" : source.currentSchemaName+"."+obj.id.name,
                "shortName": obj.id.name,
                "diff"     : obj.diff
        };

        obj.columnsLabels = {};

        variables.variables["column"] = {
                "fullName" : "",
                "shortName": "",
                "diff"     : ""
        };

        let labelsWorkingContext = initLabelsWorkingContext();

        computeRulesForSource(rules, variables, labelsWorkingContext, "table");

        obj.labelsContext = getLabelsContext(labelsWorkingContext);
        updateLabelsCount(obj.labelsContext.labels, obj.columnsLabels, labelsFilters);

        for(let i=0; i!=obj.columns.length; i++) {
            let column = obj.columns[i];

            variables.variables["column"] = {
                    "fullName" : source.currentSchemaName+"."+obj.id.name+"."+column.name,
                    "shortName": column.name,
                    "diff"     : column.diff
            };

            let labelsWorkingContext = initLabelsWorkingContext();

            if (returnVariables) {
                return variables;
            }

            computeRulesForSource(rules, variables, labelsWorkingContext, "column");

            column.labelsContext = getLabelsContext(labelsWorkingContext);
            updateLabelsCount(column.labelsContext.labels, obj.columnsLabels, labelsFilters);
        }
    }
}

function computeRulesForSource(rules, variables, labelsWorkingContext, scope) {
    let labels = labelsWorkingContext.labels;
    let labelsComments = labelsWorkingContext.labelsComments;
    let candidateFks = labelsWorkingContext.candidateFks;

    for(let iRule=0; iRule!=rules.length; iRule	++) {
        let rule = rules[iRule];
        let parsedRule = rule.parsedRule;

        if (!rule.scope && scope != "column") {
            continue;
        }
        if (rule.scope && rule.scope != "all" && rule.scope != scope) {
            continue;
        }

        variables.customArrays = {};
        variables.customVariables = {};
        let result = ruleCompute(parsedRule, variables, labels);
        if(result) {
            let ruleType = getRuleType(rule);
            let byType = labels[ruleType];
            if (!byType) {
                byType = {
                    labels : [],
                    displays : []
                };
                labels[ruleType] = byType;
            }
            byType.labels.push(rule.label);
            byType.displays.push(getLabelDisplay(rule));

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
