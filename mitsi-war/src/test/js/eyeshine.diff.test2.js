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
              },
              {
                 "owner":"PUBLIC",
                 "name":"CHECK_1",
                 "tableName":"GALAXY",
                 "type":"C",
                 "checkCondition":"LENGTH(name) > 3"
              },
              {
                 "name":"CONSTRAINT_8",
                 "tableName":"GALAXY",
                 "type":"U",
                 "columns":"NAME"
              }
,
              {
                 "name":"STRANGE_CONSTRAINT",
                 "tableName":"GALAXY",
                 "type":"something"
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

  let getMergedDatasource = function(datasource, clone) {
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
            datasourceName : "CLONE",
            currentSchemaName : clone.currentSchemaName,
            databaseObjects : clone.objects
        }
    });

    return mergeObjectsResponses(responses);
  }

  it("diff 2 identical datasources", function() {
    let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

    let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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
                simple        : "false",
                technical     : "false",
                model         : "false",
                other         : "false"
            });
        }
    }
  });

  it("diff 2 datasources with 1 new table", function() {
    let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

    clone.objects.push({
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

    let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

    for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
        let o = mergedDatasource.data.databaseObjects[i];

        if (o.id.name == "CLONE") {
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
  });

  it("diff 2 datasources with 1 new column", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone.objects[0].columns.push({
           "name":"DIFF",
           "type":"4",
           "length":0,
           "description":""
        });

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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
    });

  it("diff 2 datasources with 1 column with different name", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone.objects[0].columns[0].name = "DIFF"; // instead of ID

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

      expect(mergedDatasource.data.databaseObjects[0].columns.length).toBe(3);
      expect(mergedDatasource.data.databaseObjects[0].columns[0].name).toBe("ID");
      expect(mergedDatasource.data.databaseObjects[0].columns[1].name).toBe("DIFF");
      expect(mergedDatasource.data.databaseObjects[0].columns[2].name).toBe("NAME");

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

  it("diff 2 datasources with 1 column with different type", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone.objects[0].columns[0].type = "5";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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

  it("diff 2 datasources with 1 column with different length", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone.objects[0].columns[0].length = 10;

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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

  it("diff 2 datasources with 1 column with different description", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone.objects[0].columns[0].description = "coucou";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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

    it("diff 2 datasources with 1 fk added", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[3].id.name).toBe("SATELLITE");
      clone.objects[3].constraints.push({
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

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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

    it("diff 2 datasources with 1 fk with different name", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[1].id.name).toBe("PLANET");
      expect(clone.objects[1].constraints[0].name).toBe("CONSTRAINT_8CD");
      clone.objects[1].constraints[0].name = "DIFF";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 1) {
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

    it("diff 2 datasources with 1 fk with different fkConstraintName", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[1].id.name).toBe("PLANET");
      expect(clone.objects[1].constraints[0].name).toBe("CONSTRAINT_8CD");
      clone.objects[1].constraints[0].fkConstraintName = "DIFF";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 1) {
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

    it("diff 2 datasources with 1 fk with different fkConstraintOwner", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[1].id.name).toBe("PLANET");
      expect(clone.objects[1].constraints[0].name).toBe("CONSTRAINT_8CD");
      clone.objects[1].constraints[0].fkConstraintOwner = "DIFF";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 1) {
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

    it("diff 2 datasources with 1 added checked Constraint", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      clone.objects[0].constraints.push({
             "owner":"PUBLIC",
             "name":"CHECK_2",
             "tableName":"GALAXY",
             "type":"C",
             "checkCondition":"LENGTH(name) > 4"
      });

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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

    it("diff 2 datasources with 1 renamed checked Constraint", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[0].constraints[1].type).toBe("C");
      clone.objects[0].constraints[1].name = "DIFF";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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

    it("diff 2 datasources with 1 different PK", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[0].constraints[0].type).toBe("P");
      clone.objects[0].constraints[0].columns = "ID,NAME";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
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

    it("diff 2 datasources with 1 renamed PK", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[0].constraints[0].type).toBe("P");
      clone.objects[0].constraints[0].name = "DIFF";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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

    it("diff 2 datasources with 1 different UK", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[0].constraints[2].type).toBe("U");
      clone.objects[0].constraints[2].columns = "ID,NAME";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

      for (let i=0; i!=mergedDatasource.data.databaseObjects.length; i++) {
          let o = mergedDatasource.data.databaseObjects[i];

          if (i == 0) {
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

    it("diff 2 datasources with 1 renamed UK", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[0].constraints[2].type).toBe("U");
      clone.objects[0].constraints[2].name = "DIFF";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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

    it("diff 2 datasources with 1 renamed strange constraint", function() {
      let clone = JSON.parse(JSON.stringify(solarSystemDatasource));

      expect(clone.objects[0].constraints[3].type).toBe("something");
      clone.objects[0].constraints[3].name = "DIFF";

      let mergedDatasource = getMergedDatasource(solarSystemDatasource, clone);

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