describe("eyeshine labels computation", function() {

  let packageRules =  [
         { "label":"G",
           "rule": "table.shortName LIKE 'G.*'",
           "comment":"Primary Key (constraint(s) : ${pkColumn.constraint.name}, column position in PK : ${pkColumn.position})",
           "scope" : "table"
         },
         { "label":"PK",
           "labelDisplay":"PK_display",
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
           "comment":"Indexed by ${indexes.columns[column.fullName].index.owner}.${indexes.columns[column.fullName].index.name} (position in index : #${indexes.columns[column.fullName].position})"
         },
         { "label":"FK??",
           "labelDisplay":"FK_display",
           "type":"warning",
           "rule": "prefix:(column.shortName LIKE '(.*)_FK') AND NOT LABELLED 'FK' AND prefix.group1 IN tables.byShortName",
           "candidateFkToTable" : "${source.currentSchema}.${prefix.group1}",
           "comment":"Column ${column.shortName} ending with '_FK', is it a foreign key to ${prefix.group1} ?"
         },
         { "label":"FK2?",
           "type":"warning",
           "rule": "prefix1:(column.shortName LIKE 'PLA(.*)_FK') AND NOT LABELLED 'FK' AND '${source.currentSchema}.PLA${prefix1.group1}' IN tables.byFullName",
           "candidateFkToTable" : "${source.currentSchema}.PLA${prefix1.group1}",
           "comment":"FK2: Column ${column.shortName} ending with '_FK', is it a foreign key to PLA${prefix1.group1} ? test : var from other rule ${prefix.group1} ;"
         },
         { "label":"FK3?",
           "type":"warning",
           "rule": "prefix:(column.shortName LIKE '.*A(.*)_FK') AND NOT LABELLED 'FK' AND '${source.currentSchema}.PLA${prefix.group1}' IN tables.byFullName",
           "candidateFkToTable" : "${source.currentSchema}.PLA${prefix.group1}",
           "comment":"FK3: Column ${column.shortName} ending with '_FK', is it a foreign key to PLA${prefix.group1} ?"
         },
         { "label":"FK?",
           "type":"warning",
            "rule": "column.fullName LIKE '.*_FK' AND NOT LABELLED 'FK' AND NOT LABELLED 'FK??'",
           "comment":"Column name ${column.shortName} ending with '_FK', should it be declared as a Foreign Key ?"
         },
         { "label":"I?",
           "type":"warning",
           "rule": "column.fullName IN foreignKeys.columns AND NOT LABELLED 'I'",
           "comment":"${column.shortName} is declared as a Foreign Key, but without any index. If the target table is deleted/updated often, an index should be created for this column."
         }
    ];

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
              }/*, TODO : supprimer cet index de l'exemple SQL ?
              {
                 "owner":"PUBLIC",
                 "tableName":"PLANET",
                 "name":"CONSTRAINT_INDEX_8",
                 "type":"3",
                 "uniqueness":"f",
                 "columns":"STAR_FK"
              }*/
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
              },
              { // TODO : rajouter cette contrainte sur l'exemple
                 "owner":"PUBLIC",
                 "tableName":"PLANET_TYPE",
                 "name":"UK_9999",
                 "type":"3",
                 "uniqueness":"t",
                 "columns":"NAME"
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
     ]
  };

  it("compute labels for the solar system example database", function() {
    computeColumnLabels(solarSystemDatasource, packageRules);

    let galaxy = solarSystemDatasource.objects[0];
    expect(galaxy.id).toEqual( {
        "type":"table",
        "schema":"PUBLIC",
        "name":"GALAXY"
    } );

    // table label
    expect(galaxy.labelsContext.labels).toEqual(["G"]);

    // GALAXY.ID
    let galaxy_Pk = galaxy.columns[0];
    expect(galaxy_Pk.name).toBe("ID");
    expect(galaxy_Pk.labelsContext.labels).toEqual(["PK"]);
    expect(galaxy_Pk.labelsContext.labelsStringByType).toEqual( {
        "normal":"PK_display"
    } );
    expect(galaxy_Pk.labelsContext.labelsComments).toEqual( [
       "Primary Key (constraint(s) : CONSTRAINT_7, column position in PK : 1)"
    ] );
    expect(galaxy_Pk.labelsContext.candidateFks).toEqual([]);

    // GALAXY.NAME
    let galaxy_Name = galaxy.columns[1];
    expect(galaxy_Name.name).toBe("NAME");
    expect(galaxy_Name.labelsContext.labels).toEqual([]);
    expect(galaxy_Name.labelsContext.labelsStringByType).toEqual( { } );
    expect(galaxy_Name.labelsContext.labelsComments).toEqual([]);
    expect(galaxy_Name.labelsContext.candidateFks).toEqual([]);



    let planet = solarSystemDatasource.objects[1];
    expect(planet.id).toEqual( {
      "type":"table",
      "schema":"PUBLIC",
      "name":"PLANET"
    } );


    // PLANET.NAME
    let planet_Name = planet.columns[1];
    expect(planet_Name.name).toBe("NAME");
    expect(planet_Name.labelsContext.labels).toEqual(["I"]);
    expect(planet_Name.labelsContext.labelsStringByType).toEqual( {
        "normal" : "I"
    } );
    expect(planet_Name.labelsContext.labelsComments).toEqual( [
        "Indexed by PUBLIC.NAME_INDEX_1 (position in index : #1)"
    ] );
    expect(planet_Name.labelsContext.candidateFks).toEqual([]);

    // PLANET.PLANET_TYPE_FK
    let planet_TypeFk = planet.columns[4];
    expect(planet_TypeFk.name).toBe("PLANET_TYPE_FK");
    expect(planet_TypeFk.labelsContext.labels).toEqual(["FK", "I"]);
    expect(planet_TypeFk.labelsContext.labelsStringByType).toEqual( {
        "normal" : "FK,I"
    } );
    expect(planet_TypeFk.labelsContext.labelsComments).toEqual( [
        "Foreign Key constraint PUBLIC.CONSTRAINT_8CD (column position in FK : #1)",
        "Indexed by PUBLIC, PUBLIC.CONSTRAINT_INDEX_8C, NAME_INDEX_1 (position in index : #1, 2)" // TODO : a revoir avec des arrays
    ] );
    expect(planet_TypeFk.labelsContext.candidateFks).toEqual([]);



    let planetType = solarSystemDatasource.objects[2];
    expect(planetType.id).toEqual( {
      "type":"table",
      "schema":"PUBLIC",
      "name":"PLANET_TYPE"
    } );

    // PLANET_TYPE.NAME
    let planetType_Name = planetType.columns[1];
    expect(planetType_Name.name).toBe("NAME");
    expect(planetType_Name.labelsContext.labels).toEqual(["UK"]);
    expect(planetType_Name.labelsContext.labelsStringByType).toEqual( {
        "normal" : "UK"
    } );
    expect(planetType_Name.labelsContext.labelsComments).toEqual( [
        "Unique constraint indexed by PUBLIC.UK_9999 (position in index : #1)"
    ] );
    expect(planetType_Name.labelsContext.candidateFks).toEqual([]);

    // PLANET.STAR_FK
    let planet_starFk = planet.columns[3];
    expect(planet_starFk.name).toBe("STAR_FK");
    expect(planet_starFk.labelsContext.labels).toEqual(["FK", "I?"]);
    expect(planet_starFk.labelsContext.labelsStringByType).toEqual( {
        "normal"  : "FK",
        "warning" : "I?"
    } );
    expect(planet_starFk.labelsContext.labelsComments).toEqual( [
        "Foreign Key constraint PUBLIC.CONSTRAINT_8C (column position in FK : #1)",
        "STAR_FK is declared as a Foreign Key, but without any index. If the target table is deleted/updated often, an index should be created for this column."
    ] );
    expect(planet_starFk.labelsContext.candidateFks).toEqual([]);



    let star = solarSystemDatasource.objects[3];
    expect(star.id).toEqual( {
      "type":"table",
      "schema":"PUBLIC",
      "name":"SATELLITE"
    } );

    // PLANET.PLANET_FK
    let star_PlanetFk = star.columns[2];
    expect(star_PlanetFk.name).toBe("PLANET_FK");
    expect(star_PlanetFk.labelsContext.labels).toEqual(["FK??","FK2?","FK3?"]);
    expect(star_PlanetFk.labelsContext.labelsStringByType).toEqual( {
        "warning" : "FK_display,FK2?,FK3?"
    } );
    expect(star_PlanetFk.labelsContext.labelsComments).toEqual( [
        "Column PLANET_FK ending with '_FK', is it a foreign key to PLANET ?",
        "FK2: Column PLANET_FK ending with '_FK', is it a foreign key to PLANET ? test : var from other rule  ;",
        "FK3: Column PLANET_FK ending with '_FK', is it a foreign key to PLANET ?"
    ] );
    expect(star_PlanetFk.labelsContext.candidateFks).toEqual([{
        "targetTableName": "PUBLIC.PLANET",
        "comment": "Column PLANET_FK ending with '_FK', is it a foreign key to PLANET ?"
       },{
        "targetTableName": "PUBLIC.PLANET",
        "comment": "FK2: Column PLANET_FK ending with '_FK', is it a foreign key to PLANET ? test : var from other rule  ;"
       },{
        "targetTableName": "PUBLIC.PLANET",
        "comment": "FK3: Column PLANET_FK ending with '_FK', is it a foreign key to PLANET ?"
       }
    ]);

  });

});