describe("eyeshine labels computation", function() {

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

  let getMergedDatasource = function(datasource, clone1, clone2) {
    let responses = [];
    responses.push({
        data : {
            datasourceName : "ORIGINAL",
            currentSchemaName : datasource.currentSchemaName,
            databaseObjects : datasource.objects
        }
    });
    responses.push({
        data : {
            datasourceName : "CLONE1",
            currentSchemaName : clone1.currentSchemaName,
            databaseObjects : clone1.objects
        }
    });
    responses.push({
        data : {
            datasourceName : "CLONE2",
            currentSchemaName : clone2.currentSchemaName,
            databaseObjects : clone2.objects
        }
    });

    return mergeObjectsResponses(responses);
  }

  it("diff 3 identical datasources", function() {
    let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
    let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

    let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

    for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
        let o = mergedDatasource.data.databaseObjects[i];

        expect(o.diff).toEqual({
            notEverywhere : "false",
            simple        : "false",
            technical     : "false",
            model         : "false",
            other         : "false"
        });

        for (let j=0; j!=o.columns.length; j++) {
            let c = o.columns[j];

            expect(c.diff).toEqual({
                notEverywhere : "false",
                simple : "false",
                technical : "false",
                model : "false",
                other : "false",
            });
        }

    }

  });

  it("diff 3 datasources with 1 new table in 1 datasource", function() {
    let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
    let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

    clone1.objects.push({
       "id":{
          "type":"table",
          "schema":"PUBLIC",
          "name":"CLONE"
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
       "indexes":[ ],
       "constraints":[ ],
       "partitionned":false
    });

    let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

    let nbCloneTable = 0;
    for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
        let o = mergedDatasource.data.databaseObjects[i];

        if (o.id.name == "CLONE") {
            nbCloneTable++;

            expect(o.diff).toEqual({
                notEverywhere : "true",
                simple        : "false",
                technical     : "false",
                model         : "false",
                other         : "false"
            });
        }
        else {
            expect(o.diff).toEqual({
                notEverywhere : "false",
                simple        : "false",
                technical     : "false",
                model         : "false",
                other         : "false"
            });
        }

        for (let j=0; j!=o.columns.length; j++) {
            let c = o.columns[j];

            if (o.id.name == "CLONE") {
                expect(c.diff).toEqual({
                    notEverywhere : "true",
                    simple        : "false",
                    technical     : "false",
                    model         : "false",
                    other         : "false"
                });
            }
            else {
                expect(c.diff).toEqual({
                    notEverywhere : "false",
                    simple        : "false",
                    technical     : "false",
                    model         : "false",
                    other         : "false"
                });
            }
        }

    }
    expect(nbCloneTable).toBe(1);

  });

  it("diff 3 datasources with 1 new table in 2 datasources", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects.push({
         "id":{
            "type":"table",
            "schema":"PUBLIC",
            "name":"CLONE"
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
         "indexes":[ ],
         "constraints":[ ],
         "partitionned":false
      });

      clone2.objects.push({
         "id":{
            "type":"table",
            "schema":"PUBLIC",
            "name":"CLONE"
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
         "indexes":[ ],
         "constraints":[ ],
         "partitionned":false
      });

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      let nbCloneTable = 0;
      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (o.id.name == "CLONE") {
              nbCloneTable++;

              expect(o.diff).toEqual({
                  notEverywhere : "true",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (o.id.name == "CLONE") {
                  expect(c.diff).toEqual({
                      notEverywhere : "true",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }
      expect(nbCloneTable).toBe(1);

  });

  it("diff 3 datasources with 1 new column in 1 datasource", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns.push({
           "name":"DIFF",
           "type":"4",
           "length":0,
           "description":""
        });

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      let nbNewColumns = 0;
      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "true",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (c.name == "DIFF") {
                  nbNewColumns ++;
                  expect(c.diff).toEqual({
                      notEverywhere : "true",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }
      expect(nbNewColumns).toBe(1);

  });

  it("diff 3 datasources with 1 new column in 2 datasources in same position", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns.push({
           "name":"DIFF",
           "type":"4",
           "length":0,
           "description":""
        });
      clone2.objects[0].columns.push({
           "name":"DIFF",
           "type":"4",
           "length":0,
           "description":""
        });

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      let nbNewColumns = 0;
      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "true",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (c.name == "DIFF") {
                  nbNewColumns ++;
                  expect(c.diff).toEqual({
                      notEverywhere : "true",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }
      expect(nbNewColumns).toBe(1);

    });

  it("diff 3 datasources with 1 new column in 2 datasources in different position", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns.push({
           "name":"DIFF",
           "type":"4",
           "length":0,
           "description":""
        });
      clone2.objects[0].columns.unshift({
           "name":"DIFF",
           "type":"4",
           "length":0,
           "description":""
        });

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      let nbNewColumns = 0;
      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "true",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (c.name == "DIFF") {
                  nbNewColumns ++;
                  expect(c.diff).toEqual({
                      notEverywhere : "true",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }
      expect(nbNewColumns).toBe(1);

    });

  it("diff 3 datasources with 1 new column in 2 datasources in different position and one more column in the second one", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns.push({
           "name":"DIFF",
           "type":"4",
           "length":0,
           "description":""
        });
      clone1.objects[0].columns.push({
           "name":"DIFF2",
           "type":"4",
           "length":0,
           "description":""
        });
      clone2.objects[0].columns.unshift({
           "name":"DIFF",
           "type":"4",
           "length":0,
           "description":""
        });

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      let nbNewColumns = 0;
      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "true",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (c.name == "DIFF" || c.name == "DIFF2") {
                  nbNewColumns ++;
                  expect(c.diff).toEqual({
                      notEverywhere : "true",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }
      expect(nbNewColumns).toBe(2);

    });


  it("diff 3 datasources with 1 column with different name in the clone 1", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns[0].name = "DIFF"; // instead of ID

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      expect(mergedDatasource.data.databaseObjects[0].columns.length).toBe(3);
      expect(mergedDatasource.data.databaseObjects[0].columns[0].name).toBe("DIFF");
      expect(mergedDatasource.data.databaseObjects[0].columns[1].name).toBe("ID");
      expect(mergedDatasource.data.databaseObjects[0].columns[2].name).toBe("NAME");

      let nbNotEverywhere = 0;

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "true",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (i == 0 && (j == 0 || j == 1)) {
                  expect(c.diff).toEqual({
                      notEverywhere : "true",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
                  nbNotEverywhere ++;
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }

      expect(nbNotEverywhere).toBe(2);

  });

  it("diff 3 datasources with 1 column with different name in the clone 2", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone2.objects[0].columns[0].name = "DIFF"; // instead of ID

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      expect(mergedDatasource.data.databaseObjects[0].columns.length).toBe(3);
      expect(mergedDatasource.data.databaseObjects[0].columns[0].name).toBe("DIFF");
      expect(mergedDatasource.data.databaseObjects[0].columns[1].name).toBe("ID");
      expect(mergedDatasource.data.databaseObjects[0].columns[2].name).toBe("NAME");

      let nbNotEverywhere = 0;

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "true",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (i == 0 && (j == 0 || j == 1)) {
                  expect(c.diff).toEqual({
                      notEverywhere : "true",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
                  nbNotEverywhere ++;
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }

      expect(nbNotEverywhere).toBe(2);

  });

  it("diff 3 datasources with 1 column with different name in the clones 1 and 2", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns[0].name = "DIFF"; // instead of ID
      clone2.objects[0].columns[0].name = "DIFF"; // instead of ID

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      expect(mergedDatasource.data.databaseObjects[0].columns.length).toBe(3);
      expect(mergedDatasource.data.databaseObjects[0].columns[0].name).toBe("ID");
      expect(mergedDatasource.data.databaseObjects[0].columns[1].name).toBe("DIFF");
      expect(mergedDatasource.data.databaseObjects[0].columns[2].name).toBe("NAME");

      let nbNotEverywhere = 0;

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "true",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (i == 0 && (j == 0 || j == 1)) {
                  expect(c.diff).toEqual({
                      notEverywhere : "true",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
                  nbNotEverywhere ++;
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }

      expect(nbNotEverywhere).toBe(2);

  });

  it("diff 2 datasources with 1 column with different type in clone 1", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns[0].type = "5";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "true",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (i == 0 && j == 0) {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "true",
                      model         : "false",
                      other         : "false"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }

    });

  it("diff 3 datasources with 1 column with different type in clone 1 and 2", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns[0].type = "5";
      clone2.objects[0].columns[0].type = "5";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "true",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (i == 0 && j == 0) {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "true",
                      model         : "false",
                      other         : "false"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }

    });

  it("diff 3 datasources with 1 column with different length in clone 1", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns[0].length = 10;

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "true",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (i == 0 && j == 0) {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "true",
                      model         : "false",
                      other         : "false"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }

    });

  it("diff 3 datasources with 1 column with different length in clones 1 and 2", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns[0].length = 10;
      clone2.objects[0].columns[0].length = 10;

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "true",
                  model         : "false",
                  other         : "false"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (i == 0 && j == 0) {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "true",
                      model         : "false",
                      other         : "false"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }

  });

  it("diff 3 datasources with 1 column with different description in clone 1", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns[0].description = "coucou";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "true"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (i == 0 && j == 0) {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "true"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }

    });

  it("diff 3 datasources with 1 column with different description in clones 1 and 2", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone1.objects[0].columns[0].description = "coucou";
      clone2.objects[0].columns[0].description = "coucou";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "true"
              });
          }
          else {
              expect(o.diff).toEqual({
                  notEverywhere : "false",
                  simple        : "false",
                  technical     : "false",
                  model         : "false",
                  other         : "false"
              });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              if (i == 0 && j == 0) {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "true"
                  });
              }
              else {
                  expect(c.diff).toEqual({
                      notEverywhere : "false",
                      simple        : "false",
                      technical     : "false",
                      model         : "false",
                      other         : "false"
                  });
              }
          }

      }

    });


    it("diff 3 datasources with 1 fk added in clone 1", function() {
      let clone1 = JSON.parse(JSON.stringify(solarSystemDatasource));
      let clone2 = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone1.objects[3].id.name).toBe("SATELLITE");
      clone1.objects[3].constraints.push({
         "owner":"PUBLIC",
         "name":"DIFF",
         "tableName":"SATELLITE",
         "type":"R",
         "columns":"PLANET_FK",
         "fkConstraintOwner":"PUBLIC",
         "fkConstraintName":"CONSTRAINT_8",
         "fkTable":"PLANET",
         "fkColumns":"ID"
      });

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone1, clone2);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 3) {
            expect(o.diff).toEqual({
                notEverywhere : "false",
                simple        : "false",
                technical     : "false",
                model         : "true",
                other         : "false"
            });
          }
          else {
            expect(o.diff).toEqual({
                notEverywhere : "false",
                simple        : "false",
                technical     : "false",
                model         : "false",
                other         : "false"
            });
          }

          for (let j=0; j!=o.columns.length; j++) {
              let c = o.columns[j];

              expect(c.diff).toEqual({
                    notEverywhere : "false",
                    simple        : "false",
                    technical     : "false",
                    model         : "false",
                    other         : "false"
              });
          }

      }

    });

    // TODO : indexes
});