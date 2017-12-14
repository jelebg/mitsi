describe("eyeshine collections computation", function() {

  let solarSystemDatasource = {
     "currentSchemaName" : "PUBLIC",
     "objects":[
        {
           "id":{
              "type":"table",
              "schema":"PUBLIC",
              "name":"GALAXY"
           },
           "secondaryType":"TABLE",
           "description":"",
           "columns":[
              {
                 "name":"ID",
                 "type":"4",
                 "length":0,
                 "description":""
              },
              {
                 "name":"NAME",
                 "type":"12",
                 "length":0,
                 "description":""
              }
           ],
           "indexes":[
              {
                 "owner":"PUBLIC",
                 "tableName":"GALAXY",
                 "name":"PRIMARY_KEY_7",
                 "type":"3",
                 "uniqueness":"t",
                 "columns":"ID"
              }
           ],
           "constraints":[
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_7",
                 "tableName":"GALAXY",
                 "type":"P",
                 "columns":"ID"
              }
           ],
           "partitionned":false
        },
        {
           "id":{
              "type":"table",
              "schema":"PUBLIC",
              "name":"PLANET"
           },
           "secondaryType":"TABLE",
           "description":"",
           "columns":[
              {
                 "name":"ID",
                 "type":"4",
                 "length":0,
                 "description":""
              },
              {
                 "name":"NAME",
                 "type":"12",
                 "length":0,
                 "description":""
              },
              {
                 "name":"DESCRIPTION",
                 "type":"12",
                 "length":0,
                 "description":""
              },
              {
                 "name":"STAR_FK",
                 "type":"4",
                 "length":0,
                 "description":""
              },
              {
                 "name":"PLANET_TYPE_FK",
                 "type":"4",
                 "length":0,
                 "description":""
              }
           ],
           "indexes":[
              {
                 "owner":"PUBLIC",
                 "tableName":"PLANET",
                 "name":"CONSTRAINT_INDEX_8C",
                 "type":"3",
                 "uniqueness":"f",
                 "columns":"PLANET_TYPE_FK"
              },
              {
                 "owner":"PUBLIC",
                 "tableName":"PLANET",
                 "name":"NAME_INDEX_1",
                 "type":"3",
                 "uniqueness":"f",
                 "columns":"NAME,PLANET_TYPE_FK"
              },
              {
                 "owner":"PUBLIC",
                 "tableName":"PLANET",
                 "name":"PRIMARY_KEY_8",
                 "type":"3",
                 "uniqueness":"t",
                 "columns":"ID"
              },
              {
                 "owner":"PUBLIC",
                 "tableName":"PLANET",
                 "name":"CONSTRAINT_INDEX_8",
                 "type":"3",
                 "uniqueness":"f",
                 "columns":"STAR_FK"
              }
           ],
           "constraints":[
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_8CD",
                 "tableName":"PLANET",
                 "type":"R",
                 "columns":"PLANET_TYPE_FK",
                 "fkConstraintOwner":"PUBLIC",
                 "fkConstraintName":"PRIMARY_KEY_3",
                 "fkTable":"PLANET_TYPE",
                 "fkColumns":"ID"
              },
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_8C",
                 "tableName":"PLANET",
                 "type":"R",
                 "columns":"STAR_FK",
                 "fkConstraintOwner":"PUBLIC",
                 "fkConstraintName":"PRIMARY_KEY_2",
                 "fkTable":"STAR",
                 "fkColumns":"ID"
              },
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_8",
                 "tableName":"PLANET",
                 "type":"P",
                 "columns":"ID"
              }
           ],
           "partitionned":false
        },
        {
           "id":{
              "type":"table",
              "schema":"PUBLIC",
              "name":"PLANET_TYPE"
           },
           "secondaryType":"TABLE",
           "description":"",
           "columns":[
              {
                 "name":"ID",
                 "type":"4",
                 "length":0,
                 "description":""
              },
              {
                 "name":"NAME",
                 "type":"12",
                 "length":0,
                 "description":""
              },
              {
                 "name":"DESCRIPTION",
                 "type":"12",
                 "length":0,
                 "description":""
              }
           ],
           "indexes":[
              {
                 "owner":"PUBLIC",
                 "tableName":"PLANET_TYPE",
                 "name":"PRIMARY_KEY_3",
                 "type":"3",
                 "uniqueness":"t",
                 "columns":"ID"
              }
           ],
           "constraints":[
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_3",
                 "tableName":"PLANET_TYPE",
                 "type":"P",
                 "columns":"ID"
              }
           ],
           "partitionned":false
        },
        {
           "id":{
              "type":"table",
              "schema":"PUBLIC",
              "name":"SATELLITE"
           },
           "secondaryType":"TABLE",
           "description":"",
           "columns":[
              {
                 "name":"ID",
                 "type":"4",
                 "length":0,
                 "description":""
              },
              {
                 "name":"NAME",
                 "type":"12",
                 "length":0,
                 "description":""
              },
              {
                 "name":"PLANET_FK",
                 "type":"4",
                 "length":0,
                 "description":""
              }
           ],
           "indexes":[
              {
                 "owner":"PUBLIC",
                 "tableName":"SATELLITE",
                 "name":"PRIMARY_KEY_4",
                 "type":"3",
                 "uniqueness":"t",
                 "columns":"ID"
              }
           ],
           "constraints":[
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_4",
                 "tableName":"SATELLITE",
                 "type":"P",
                 "columns":"ID"
              }
           ],
           "partitionned":false
        },
        {
           "id":{
              "type":"table",
              "schema":"PUBLIC",
              "name":"SPECTRAL_TYPE"
           },
           "secondaryType":"TABLE",
           "description":"",
           "columns":[
              {
                 "name":"ID",
                 "type":"4",
                 "length":0,
                 "description":""
              },
              {
                 "name":"NAME",
                 "type":"12",
                 "length":0,
                 "description":""
              },
              {
                 "name":"DESCRIPTION",
                 "type":"12",
                 "length":0,
                 "description":""
              }
           ],
           "indexes":[
              {
                 "owner":"PUBLIC",
                 "tableName":"SPECTRAL_TYPE",
                 "name":"PRIMARY_KEY_A",
                 "type":"3",
                 "uniqueness":"t",
                 "columns":"ID"
              }
           ],
           "constraints":[
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_A",
                 "tableName":"SPECTRAL_TYPE",
                 "type":"P",
                 "columns":"ID"
              }
           ],
           "partitionned":false
        },
        {
           "id":{
              "type":"table",
              "schema":"PUBLIC",
              "name":"STAR"
           },
           "secondaryType":"TABLE",
           "description":"",
           "columns":[
              {
                 "name":"ID",
                 "type":"4",
                 "length":0,
                 "description":""
              },
              {
                 "name":"NAME",
                 "type":"12",
                 "length":0,
                 "description":""
              },
              {
                 "name":"SPECTRAL_TYPE_FK",
                 "type":"4",
                 "length":0,
                 "description":""
              },
              {
                 "name":"GALAXY_FK",
                 "type":"4",
                 "length":0,
                 "description":""
              }
           ],
           "indexes":[
              {
                 "owner":"PUBLIC",
                 "tableName":"STAR",
                 "name":"PRIMARY_KEY_2",
                 "type":"3",
                 "uniqueness":"t",
                 "columns":"ID"
              },
              {
                 "owner":"PUBLIC",
                 "tableName":"STAR",
                 "name":"CONSTRAINT_INDEX_2",
                 "type":"3",
                 "uniqueness":"f",
                 "columns":"SPECTRAL_TYPE_FK"
              },
              {
                 "owner":"PUBLIC",
                 "tableName":"STAR",
                 "name":"CONSTRAINT_INDEX_26",
                 "type":"3",
                 "uniqueness":"f",
                 "columns":"GALAXY_FK"
              }
           ],
           "constraints":[
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_26",
                 "tableName":"STAR",
                 "type":"R",
                 "columns":"SPECTRAL_TYPE_FK",
                 "fkConstraintOwner":"PUBLIC",
                 "fkConstraintName":"PRIMARY_KEY_A",
                 "fkTable":"SPECTRAL_TYPE",
                 "fkColumns":"ID"
              },
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_2",
                 "tableName":"STAR",
                 "type":"P",
                 "columns":"ID"
              },
              {
                 "owner":"PUBLIC",
                 "name":"CONSTRAINT_26F",
                 "tableName":"STAR",
                 "type":"R",
                 "columns":"GALAXY_FK",
                 "fkConstraintOwner":"PUBLIC",
                 "fkConstraintName":"PRIMARY_KEY_7",
                 "fkTable":"GALAXY",
                 "fkColumns":"ID"
              }
           ],
           "partitionned":false
        }
     ],
     "schemas":[
        {
           "name":"INFORMATION_SCHEMA",
           "current":false
        },
        {
           "name":"PUBLIC",
           "current":true
        }
     ],
     "provider":"h2",
     "rules":[
        {
           "rule":"pkColumn:(column.fullName in primaryKeys.columns)",
           "label":"PK",
           "comment":"Primary Key (constraint(s) : ${pkColumn.constraint.name}, column position in PK : ${pkColumn.position})"
        },
        {
           "rule":"column.fullName IN uniqueContraints.columns AND NOT LABELLED \u0027PK\u0027",
           "label":"UK",
           "comment":"Unique constraint indexed by ${uniqueContraints.columns[column.fullName].index.owner}.${uniqueContraints.columns[column.fullName].index.name} (position in index : #${index.columns[column.fullName].position})"
        },
        {
           "rule":"column.fullName IN foreignKeys.columns",
           "label":"FK",
           "comment":"Foreign Key constraint ${foreignKeys.columns[column.fullName].constraint.owner}.${foreignKeys.columns[column.fullName].constraint.name} (column position in FK : #${foreignKeys.columns[column.fullName].position})"
        },
        {
           "rule":"column.fullName IN index.columns ",
           "label":"I",
           "comment":"Indexed by ${index.columns[column.fullName].index.owner}.${index.columns[column.fullName].index.name} (position in index : #${index.columns[column.fullName].position})"
        },
        {
           "rule":"prefix:(column.shortName LIKE \u0027(.*)_FK\u0027) AND NOT LABELLED \u0027FK\u0027 AND prefix.group1 IN tables.byShortName",
           "labelWarning":"FK??",
           "comment":"Column ${column.shortName} ending with \u0027_FK\u0027, is it a foreign key to ${prefix.group1} ?",
           "candidateFkToTable":"${source.currentSchema}.${prefix.group1}"
        },
        {
           "rule":"column.fullName LIKE \u0027.*_FK\u0027 AND NOT LABELLED \u0027FK\u0027 AND NOT LABELLED \u0027FK??\u0027",
           "labelWarning":"FK?",
           "comment":"Column name ${column.shortName} ending with \u0027_FK\u0027, should it be declared as a Foreign Key ?"
        },
        {
           "rule":"column.fullName IN foreignKeys.columns AND NOT column.fullName IN index.columns",
           "labelWarning":"I?",
           "comment":"${column.shortName} is declared as a Foreign Key, but without any index. If the target table is deleted/updated often, an index should be created for this column."
        }
     ]
  }

  it("compute collection for the solar system example database", function() {
    let collections = {};
    computeColumnCollections(solarSystemDatasource, collections);

    // collections list

    expect(Object.keys(collections)).toEqual( [
        "foreignKeys",
        "primaryKeys",
        "uniqueContraints", // TODO : renommer uniqueConstraints avec un s
        "index", // TODO : renommer en indexs
        "tables"
    ] );

    // collections in collections lists

    expect(Object.keys(collections.foreignKeys)).toEqual( [
        "columns"
    ]);

    expect(Object.keys(collections.primaryKeys)).toEqual( [
        "columns"
    ]);

    expect(Object.keys(collections.uniqueContraints)).toEqual( [
        "columns"
    ]);

    expect(Object.keys(collections.index)).toEqual( [
        "columns",
        "columnsDefinitions" // TODO : pas sur de garder
    ]);

    expect(Object.keys(collections.tables)).toEqual( [
        "byShortName",
        "byFullName"
    ]);

    expect(Object.keys(collections.tables)).toEqual( [
        "byShortName",
        "byFullName"
    ]);

    // foreign keys column collection

    expect(collections.foreignKeys.columns["PUBLIC.PLANET.PLANET_TYPE_FK"]).toEqual(
        [ {
              "constraint": {
                "owner": "PUBLIC",
                "name": "CONSTRAINT_8CD",
                "tableName": "PLANET",
                "type": "R",
                "columns": "PLANET_TYPE_FK",
                "fkConstraintOwner": "PUBLIC",
                "fkConstraintName": "PRIMARY_KEY_3",
                "fkTable": "PLANET_TYPE",
                "fkColumns": "ID"
              },
              "position": 1,
              "columnsDefinition": "PLANET_TYPE_FK"
        } ]
    );

    // TODO : créer une colonne qui pointe sur deux FK, meme si en vrai c'est très très rare

    // primary keys column collection

    expect(collections.primaryKeys.columns["PUBLIC.GALAXY.ID"]).toEqual(
        [
            {
              "constraint": {
                "owner": "PUBLIC",
                "name": "CONSTRAINT_7",
                "tableName": "GALAXY",
                "type": "P",
                "columns": "ID"
              },
              "position": 1,
              "columnsDefinition": "ID"
            }
        ]
    );

    // unique contraints column collection

    expect(collections.uniqueContraints.columns["PUBLIC.GALAXY.ID"]).toEqual(
        [
            {
              "index": {
                "owner": "PUBLIC",
                "tableName": "GALAXY",
                "name": "PRIMARY_KEY_7",
                "type": "3",
                "uniqueness": "t",
                "columns": "ID"
              },
              "position": 1,
              "columnsDefinition": "ID"
            }
        ]
    );

    // TODO : créer une colonne qui appartient à deux UK différentes, même si ça n'arrive aps très très souvent

    // index collection

    expect(collections.index.columns["PUBLIC.GALAXY.ID"]).toEqual(
        [
           {
             "index": {
               "owner": "PUBLIC",
               "tableName": "GALAXY",
               "name": "PRIMARY_KEY_7",
               "type": "3",
               "uniqueness": "t",
               "columns": "ID"
             },
             "position": 1,
             "columnsDefinition": "ID"
           }
        ]
    );

    expect(collections.index.columns["PUBLIC.PLANET.PLANET_TYPE_FK"]).toEqual(
        [ // TODO : refaire ces deux indexs dans le SQL et exporter les collections correctement
          {
            "index": {
              "owner": "PUBLIC",
              "tableName": "PLANET",
              "name": "CONSTRAINT_INDEX_8C",
              "type": "3",
              "uniqueness": "f",
              "columns": "PLANET_TYPE_FK"
            },
            "position": 1,
            "columnsDefinition": "PLANET_TYPE_FK" // TODO : check if correct
          },
          {
            "index": {
              "owner": "PUBLIC",
              "tableName": "PLANET",
              "name": "NAME_INDEX_1",
              "type": "3",
              "uniqueness": "f",
              "columns": "NAME,PLANET_TYPE_FK"
            },
            "position": 2,
            "columnsDefinition": "NAME,PLANET_TYPE_FK" // TODO : check if correct
          }
        ]
    );

    // TODO : columnDefinitions a revoir completement
    expect(collections.index.columnsDefinitions["PLANET_TYPE_FK"]).toEqual(
        [ // TODO : refaire ces deux indexs dans le SQL et exporter les collections correctement
          {
            "index": {
              "owner": "PUBLIC",
              "tableName": "PLANET",
              "name": "CONSTRAINT_INDEX_8C",
              "type": "3",
              "uniqueness": "f",
              "columns": "PLANET_TYPE_FK"
            },
            "position": 1,
            "columnsDefinition": "PLANET_TYPE_FK" // TODO : check if correct
          }
        ]
    );

    expect(collections.index.columnsDefinitions["NAME,PLANET_TYPE_FK"]).toEqual(
        [ // TODO : refaire ces deux indexs dans le SQL et exporter les collections correctement
          {
            "index": {
              "owner": "PUBLIC",
              "tableName": "PLANET",
              "name": "NAME_INDEX_1",
              "type": "3",
              "uniqueness": "f",
              "columns": "NAME,PLANET_TYPE_FK"
            },
            "position": 2,
            "columnsDefinition": "NAME,PLANET_TYPE_FK" // TODO : check if correct
          }
        ]
    );

    // table collection

    // TODO : rajouter des donnees dans la collection tables : colonnes etc. verifier le besoin
    expect(collections.tables.byShortName["GALAXY"]).toEqual(
        [
            {
              "shortName": "GALAXY",
              "fullName": "PUBLIC.GALAXY"
            }
        ]
    );

    expect(collections.tables.byFullName["PUBLIC.GALAXY"]).toEqual(
        [
            {
              "shortName": "GALAXY",
              "fullName": "PUBLIC.GALAXY"
            }
        ]
    );


  });

});