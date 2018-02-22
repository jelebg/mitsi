function distinctList(arr, f, notAllEquals) {
    if (!f) {
        f = function(x) { return x; };
    }

    let u = {};
    let a = [];
    for(let i = 0, l = arr.length; i < l; ++i){
        let arrv = arr[i];
        if(!arrv) {
            continue;
        }

        let v = f(arrv);
        if(v && !u.hasOwnProperty(v)) {
            a.push(v);
            u[v] = 1;
        }
    }

    if (notAllEquals && (a.length > 1)) {
        notAllEquals.f = true;
    }

    return a;
}

function getDiffDescription (nbLayers, foundLayerNameList) {
    if (foundLayerNameList.length == nbLayers) {
        return "Exists in all layers";
    }
    return "Exists in "+foundLayerNameList.join(", ");
}

function mergeObjectsResponses(responses) {
    let merged = { data:{} };
    let nbLayers = responses.length;

    merged.data.schemas = null; // TODO : would it be usefull to switch schema on a layer ? could be difficult since schemas may not exists on other databases

    merged.data.provider = distinctList(responses, function(x) { return x.data.provider; }).join(", ");

    // TODO : logique sur les schema a revoir certainement. il pourrait etre meilleur de les effacer, peut-être sur une configuration
    let schemaList = [];
    for (let i = 0; i != responses.length; i++) {
        let sourceSchemas = responses[i].data.schemas;

        if (!sourceSchemas) {
            continue;
        }

        for (let j=0; j!=sourceSchemas.length; j++) {
            if (sourceSchemas[j].current) {
                schemaList.push(sourceSchemas[j].name);
                break;
            }
        }
    }
    merged.data.currentSchemaName = distinctList(schemaList).join(" / ");

    let doNamesOrdered = [];
    let doNamesUnique = {};
    let doBySources = [];

    for (let i=0; i!=responses.length; i++) {
        let doBySourceCurrent = {};
        doBySources.push(doBySourceCurrent);

        for (let j=0; j!=responses[i].data.databaseObjects.length; j++) {
            let o = responses[i].data.databaseObjects[j];

            if (!doNamesUnique.hasOwnProperty(o.id.name)) {
                doNamesOrdered.push(o.id.name);
                doNamesUnique[o.id.name] = true;
            }

            doBySourceCurrent[o.id.name] = o;
        }
    }

    doNamesOrdered.sort();

    let databaseObjects = [];

    for (let i=0; i!=doNamesOrdered.length; i++) {
        let doName = doNamesOrdered[i];

        let objectMergeStatus = {
            notEverywhere : { f : false},
            simple : { f : false},
            technical : { f : false},
            model : { f : false}, // TODO : usefulle ? could be modelDiff ?
            other : { f : false}
        }

        let foundList = [];
        let foundLayerNameList = [];
        for (let j=0; j!=doBySources.length; j++) {
            let doBySource = doBySources[j];
            let datasourceName = responses[j].data.datasourceName;
            let found = doBySource[doName];

            if (found) {
                foundList.push(found);
                foundLayerNameList.push(datasourceName);
            }
        }

        if (foundList.length < nbLayers) {
            objectMergeStatus.notEverywhere.f = true;
        }

        let o = {
            "id" : {
                "type"   : distinctList(foundList, function(x) { return x.id.type; }/*, objectMergeStatus.simple*/).join(", "),
                "schema" : distinctList(foundList, function(x) { return x.id.schema; }/*, objectMergeStatus.simple*/).join(", "), // TODO : si le schema est le default, et qu'ils ne sont pas tous identiques, remplacer par chaine vide
                "name"   : doName
            },
            "secondaryType"   : distinctList(foundList, function(x) { return x.secondaryType; }/*, objectMergeStatus.simple*/).join(", "),
            "diffDescription" : getDiffDescription(nbLayers, foundLayerNameList),
            "description"     : distinctList(foundList, function(x) { return x.description; }, objectMergeStatus.other).join(", "),
            "columns"         : mergeColumns(responses, foundList, function(x) { return x.columns; }, objectMergeStatus),
            "indexes"         : mergeIndexes(responses, foundList, function(x) { return x.indexes; }, objectMergeStatus, doName),
            "constraints"     : mergeConstraints(responses, foundList, function(x) { return x.constraints; }, objectMergeStatus, doName),
            "partitionned"    : distinctList(foundList, function(x) { return x.partitionned; }, objectMergeStatus.technical).join(", "),
            "partitionningBy" : distinctList(foundList, function(x) { return x.partitionningBy; }, objectMergeStatus.technical).join(", "),
        };

        o.diff = {
            notEverywhere : objectMergeStatus.notEverywhere.f.toString(),
            simple        : objectMergeStatus.simple.f.toString(),
            technical     : objectMergeStatus.technical.f.toString(),
            model         : objectMergeStatus.model.f.toString(),
            other         : objectMergeStatus.other.f.toString()
        }

        databaseObjects.push(o);
    }

    merged.data.databaseObjects = databaseObjects;

    return merged;
}

function mergeIndexes(responses, foundList, getIndexes, objectMergeStatus, objectName) {
    let mergedIndexes = [];

    let indexesInfos = { };

    for (let i=0; i!=foundList.length; i++) {
        let indexes = getIndexes(foundList[i]);

        if(!indexes) {
            continue;
        }

        for (let j=0; j!=indexes.length; j++) {
            let index = indexes[j];
            let id = index.type+"/"+index.columns;
            if (! indexesInfos.hasOwnProperty(id)) {
                indexesInfos[id] = {
                    indexes : [],
                    type : index.type,
                    columns : index.columns
                };
            }

            // we should not have two fk with same columns/fkTable/fkColumns in the same response
            indexesInfos[id].indexes[i] = index;
        }
    }

    for (let id in indexesInfos) {
        let indexInfo = indexesInfos[id];

        let mergedIndex = {
            owner : distinctList(indexInfo.indexes, function(x) { return x.owner; }, objectMergeStatus.other).join(","),
            tableName : objectName,
            name : distinctList(indexInfo.indexes, function(x) { return x.name; }, objectMergeStatus.other).join(","),
            type : indexInfo.type,
            uniqueness : distinctList(indexInfo.indexes, function(x) { return x.uniqueness; }, objectMergeStatus.technical).join(","),
            columns : indexInfo.columns
        }
        mergedIndexes.push(mergedIndex);

        for (let j = 0; j != foundList.length; j++) {
            if (indexInfo.indexes[j] === undefined) {
                objectMergeStatus.technical.f = true;
                break;
            }
        }
    }

    return mergedIndexes;
}

function mergeConstraints(responses, foundList, getConstraints, objectMergeStatus, objectName) {
    let mergedConstraints = [];

    let constraintsInfos = {
        R : {},
        C : {},
        U : {},
        P : {},
        others : {}
    };

    for (let i=0; i!=foundList.length; i++) {
        let constraints = getConstraints(foundList[i]);

        if(!constraints) {
            continue;
        }

        for (let j=0; j!=constraints.length; j++) {
            let constraint = constraints[j];
            if (constraint.type == "R") {
                let id = constraint.columns+"/"+constraint.fkTable+"/"+constraint.fkColumns;
                if (! constraintsInfos.R.hasOwnProperty(id)) {
                    constraintsInfos.R[id] = {
                        constraints : [],
                        columns   : constraint.columns,
                        fkTable   : constraint.fkTable,
                        fkColumns : constraint.fkColumns
                    };
                }

                // we should not have two fk with same columns/fkTable/fkColumns in the same response
                constraintsInfos.R[id].constraints[i] = constraint;
            }
            else if (constraint.type == "P") {
                let id = constraint.columns;
                if (! constraintsInfos.P.hasOwnProperty(id)) {
                    constraintsInfos.P[id] = {
                        constraints : [],
                        columns   : constraint.columns
                    };
                }

                // we should not have two fk with same columns/fkTable/fkColumns in the same response
                constraintsInfos.P[id].constraints[i] = constraint;
            }
            else if (constraint.type == "U") {
                let id = constraint.columns;
                if (! constraintsInfos.U.hasOwnProperty(id)) {
                    constraintsInfos.U[id] = {
                        constraints : [],
                        columns   : constraint.columns
                    };
                }

                // we should not have two fk with same columns/fkTable/fkColumns in the same response
                constraintsInfos.U[id].constraints[i] = constraint;
            }
            else if (constraint.type == "C") {
                let id = constraint.checkCondition;
                if (! constraintsInfos.C.hasOwnProperty(id)) {
                    constraintsInfos.C[id] = {
                        constraints : [],
                        checkCondition   : constraint.checkCondition
                    };
                }

                // we should not have two check constraint with same checkCondition in the same response
                constraintsInfos.C[id].constraints[i] = constraint;
            }
            else {
                let id = constraint.name;
                if (! constraintsInfos.others.hasOwnProperty(id)) {
                    constraintsInfos.others[id] = {
                        constraints : []
                    };
                }

                // we should not have two check constraint with same checkCondition in the same response
                constraintsInfos.others[id].constraints[i] = constraint;
            }
        }
    }

    for (let id in constraintsInfos.R) {
        let constraintInfo = constraintsInfos.R[id];

        let mergedConstraint = {
            name              : distinctList(constraintInfo.constraints, function(x) { return x.name; }, objectMergeStatus.other).join(","),
            fkConstraintName  : distinctList(constraintInfo.constraints, function(x) { return x.fkConstraintName; }, objectMergeStatus.other).join(","),
            fkConstraintOwner : distinctList(constraintInfo.constraints, function(x) { return x.fkConstraintOwner; }, objectMergeStatus.other).join(","),
            columns   : constraintInfo.columns,
            fkTable   : constraintInfo.fkTable,
            fkColumns : constraintInfo.fkColumns,
            type      : "R",
            tableName : objectName
        }
        mergedConstraints.push(mergedConstraint);

        for (let j = 0; j != foundList.length; j++) {
            if (constraintInfo.constraints[j] === undefined) {
                objectMergeStatus.model.f = true;
                break;
            }
        }
    }

    for (let id in constraintsInfos.P) {
        let constraintInfo = constraintsInfos.P[id];

        let mergedConstraint = {
            name              : distinctList(constraintInfo.constraints, function(x) { return x.name; }, objectMergeStatus.other).join(","),
            columns   : constraintInfo.columns,
            type      : "P",
            tableName : objectName
        }
        mergedConstraints.push(mergedConstraint);

        for (let j = 0; j != foundList.length; j++) {
            if (constraintInfo.constraints[j] === undefined) {
                objectMergeStatus.model.f = true;
                break;
            }
        }
    }

    for (let id in constraintsInfos.U) {
        let constraintInfo = constraintsInfos.U[id];

        let mergedConstraint = {
            name              : distinctList(constraintInfo.constraints, function(x) { return x.name; }, objectMergeStatus.other).join(","),
            columns   : constraintInfo.columns,
            type      : "U",
            tableName : objectName
        }
        mergedConstraints.push(mergedConstraint);

        for (let j = 0; j != foundList.length; j++) {
            if (constraintInfo.constraints[j] === undefined) {
                objectMergeStatus.model.f = true;
                break;
            }
        }
    }

    for (let id in constraintsInfos.C) {
        let constraintInfo = constraintsInfos.C[id];

        let mergedConstraint = {
            name              : distinctList(constraintInfo.constraints, function(x) { return x.name; }, objectMergeStatus.other).join(","),
            checkCondition    : constraintInfo.checkCondition,
            type      : "C",
            tableName : objectName
        }
        mergedConstraints.push(mergedConstraint);

        for (let j = 0; j != foundList.length; j++) {
            if (constraintInfo.constraints[j] === undefined) {
                objectMergeStatus.technical.f = true;
                break;
            }
        }
    }

    for (let id in constraintsInfos.others) {
        let constraintInfo = constraintsInfos.others[id];

        let mergedConstraint = {
            name      : id,
            type      : constraintInfo.type,
            tableName : objectName
        }
        mergedConstraints.push(mergedConstraint);

        for (let j = 0; j != foundList.length; j++) {
            if (constraintInfo.constraints[j] === undefined) {
                objectMergeStatus.technical.f = true;
                break;
            }
        }
    }

    return mergedConstraints;
}

function mergeColumns(responses, foundList, getColumns, objectMergeStatus) {
    let columnsByResponse = [];
    let columnIndexByResponse = [];
    let columnNameInfos = {};
    let mergedColumns = [];

    for (let i=0; i!=foundList.length; i++) {
        let columns = getColumns(foundList[i]);
        columnsByResponse[i] = columns;
        columnIndexByResponse[i] = 0;

        for (let j=0; j!=columns.length; j++) {
            let columnName = columns[j].name;
            if (columnNameInfos.hasOwnProperty(columnName)) {
                columnNameInfos[columnName].count ++;
            }
            else {
                columnNameInfos[columnName] = {
                    count : 1,
                    positions : []
                };
            }
            columnNameInfos[columnName].positions[i] = j;
        }
    }

    for (;;) {
        let minCount = 0;
        let chosenFound = -1;
        for (let i=0; i!=foundList.length; i++) {
            if (columnIndexByResponse[i] >= columnsByResponse[i].length) {
                continue;
            }

            // TODO : on doit pouvoir simplifier
            let columnName = null;
            let columnInfos = null;
            do {
                columnName = columnsByResponse[i][columnIndexByResponse[i]].name
                columnInfos = columnNameInfos[columnName];

                if (!columnInfos.alreadyDone) {
                    break;
                }

                columnIndexByResponse[i] ++;
            } while (columnIndexByResponse[i] < columnsByResponse[i].length)

            if (columnIndexByResponse[i] >= columnsByResponse[i].length) {
                continue;
            }

            if (minCount == 0 || columnInfos.count < minCount) {
                minCount = columnInfos.count;
                chosenFound = i;
            }
        }
        if (chosenFound == -1) {
            break;
        }

        columnDiff = {
            notEverywhere : { f : false },
            simple        : { f : false },
            technical     : { f : false },
            model         : { f : false },
            other         : { f : false }
        }

        if (minCount != responses.length) {
            // if the column is not on every layer, for the table it is just a simple diff, only if the table is not already known as "notEverywhere"
            if (!objectMergeStatus.notEverywhere.f) {
                objectMergeStatus.simple.f = true;
            }
            columnDiff.notEverywhere.f = true;
        }

        let chosenName = columnsByResponse[chosenFound][columnIndexByResponse[chosenFound]].name;
        let chosenInfos = columnNameInfos[chosenName];

        let columnDescriptions = [];
        let columnDescriptionsUnique = {};
        let columnLengths = [];
        let columnLengthsUnique = {};
        let columnTypes = [];
        let columnTypesUnique = {};
        let foundLayerNameList = [];

        for (let i=0; i!=foundList.length; i++) {
            if (columnIndexByResponse[i] >= columnsByResponse[i].length) {
                continue;
            }

            let column = columnsByResponse[i][columnIndexByResponse[i]];
            if (column.name != chosenName) {
                if (chosenInfos.positions[i] !== undefined) {
                    // column exists but after in the list
                    // TODO : add a status notInOrder pour le diff ??
                    column = columnsByResponse[i][chosenInfos.positions[i]];
                }
                else {
                    continue;
                }
            }
            else {
                columnIndexByResponse[i] ++;
            }

            foundLayerNameList.push(responses[i].data.datasourceName);

            if (!columnDescriptionsUnique.hasOwnProperty(column.description)) {
                columnDescriptionsUnique[column.description] = true;
                columnDescriptions.push(column.description);
            }

            if (!columnLengthsUnique.hasOwnProperty(column.length)) {
                columnLengthsUnique[column.length] = true;
                columnTypes.push(column.length);
            }

            if (!columnTypesUnique.hasOwnProperty(column.type)) {
                columnTypesUnique[column.type] = true;
                columnLengths.push(column.type);
            }
            chosenInfos.alreadyDone = true;

        }

        if (columnDescriptions.length > 1) {
            objectMergeStatus.other.f = true;
            columnDiff.other.f = true;
        }

        if (columnLengths.length > 1 ||
            columnTypes.length > 1) {
            objectMergeStatus.technical.f = true;
            columnDiff.technical.f = true;
        }

        let column = {
            "name" : chosenName,
            "diffDescription" : getDiffDescription(responses.length, foundLayerNameList),
            "description" : columnDescriptions.join(" / "),
            "length" : columnLengths.join(" / "),
            "type" : columnTypes.join(" / ")
        }

        column.diff = {
            notEverywhere : columnDiff.notEverywhere.f.toString(),
            simple        : columnDiff.simple.f.toString(),
            technical     : columnDiff.technical.f.toString(),
            model         : columnDiff.model.f.toString(),
            other         : columnDiff.other.f.toString()
        }

        mergedColumns.push(column);
    }

    return mergedColumns;
}


