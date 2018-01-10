function debugCollections(sourceName) {
    let scope = angular.element(document.getElementById("sourcesDiv")).scope();
    let rootScope = scope.$root;

    let source = null;

    if (!sourceName) {
        source = rootScope.currentSource;
        if (!source) {
            console.log("no datasource selected");
            return;
        }
    }
    else {
        for (let i=0; i!=scope.datasources.length; i++) {
            if (scope.datasources[i].name === sourceName) {
                source = scope.datasources[i];
                break;
            }
        }
    }

    if (!source) {
        console.log("source not found : "+sourceName);
        return;
    }

    let collections = {};
    computeColumnCollections(source, collections);

    return collections;
}