function distinctList(arr, f, notAllEquals) {
    if (!f) {
        f = function(x) { return x; };
    }

    let u = {};
    let a = [];
    for(let i = 0, l = arr.length; i < l; ++i){
        let v = f(arr[i]);
        if(!u.hasOwnProperty(v)) {
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
            "columns"         : mergeColumns(responses, foundList, function(x) { return x.columns; }, objectMergeStatus), // TODO
            "indexes"         : foundList[0].indexes, // TODO
            "constraints"     : foundList[0].constraints, // TODO
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

function mergeColumns(responses, foundList, getColumns, objectMergeStatus) {
    let columnsByResponse = [];
    let columnIndexByResponse = [];
    let columnNameCount = {};
    let mergedColumns = [];

    for (let i=0; i!=foundList.length; i++) {
        let columns = getColumns(foundList[i]);
        columnsByResponse[i] = columns;
        columnIndexByResponse[i] = 0;

        for (let j=0; j!=columns.length; j++) {
            let columnName = columns[j].name;
            if (columnNameCount.hasOwnProperty(columnName)) {
                columnNameCount[columnName] = columnNameCount[columnName] + 1;
            }
            else {
                columnNameCount[columnName] = 1;
            }
        }
    }

    for (;;) {
        let minCount = 0;
        let chosenFound = -1;
        for (let i=0; i!=foundList.length; i++) {
            if (columnIndexByResponse[i] >= columnsByResponse[i].length) {
                continue;
            }

            let columnName = columnsByResponse[i][columnIndexByResponse[i]].name;
            let count = columnNameCount[columnName];
            if (minCount == 0 || count < minCount) {
                minCount = count;
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
                continue;
            }
            columnIndexByResponse[i] = columnIndexByResponse[i] + 1;

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


