describe("eyeshine rule computation", function() {

    let collections = {
          "foreignKeys" : {
                "columns": {
                  "PUBLIC.PLANET.PLANET_TYPE_FK": [
                    {
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
                    }
                  ],
                  "PUBLIC.PLANET.STAR_FK": [
                    {
                      "constraint": {
                        "owner": "PUBLIC",
                        "name": "CONSTRAINT_8C",
                        "tableName": "PLANET",
                        "type": "R",
                        "columns": "STAR_FK",
                        "fkConstraintOwner": "PUBLIC",
                        "fkConstraintName": "PRIMARY_KEY_2",
                        "fkTable": "STAR",
                        "fkColumns": "ID"
                      },
                      "position": 1,
                      "columnsDefinition": "STAR_FK"
                    }
                  ],
                  "PUBLIC.STAR.SPECTRAL_TYPE_FK": [
                    {
                      "constraint": {
                        "owner": "PUBLIC",
                        "name": "CONSTRAINT_26",
                        "tableName": "STAR",
                        "type": "R",
                        "columns": "SPECTRAL_TYPE_FK",
                        "fkConstraintOwner": "PUBLIC",
                        "fkConstraintName": "PRIMARY_KEY_A",
                        "fkTable": "SPECTRAL_TYPE",
                        "fkColumns": "ID"
                      },
                      "position": 1,
                      "columnsDefinition": "SPECTRAL_TYPE_FK"
                    }
                  ],
                  "PUBLIC.STAR.GALAXY_FK": [
                    {
                      "constraint": {
                        "owner": "PUBLIC",
                        "name": "CONSTRAINT_26F",
                        "tableName": "STAR",
                        "type": "R",
                        "columns": "GALAXY_FK",
                        "fkConstraintOwner": "PUBLIC",
                        "fkConstraintName": "PRIMARY_KEY_7",
                        "fkTable": "GALAXY",
                        "fkColumns": "ID"
                      },
                      "position": 1,
                      "columnsDefinition": "GALAXY_FK"
                    }
                  ]
                }
          },
          "primaryKeys" : {
            "columns": {
              "PUBLIC.GALAXY.ID": [
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
              ],
              "PUBLIC.PLANET.ID": [
                {
                  "constraint": {
                    "owner": "PUBLIC",
                    "name": "CONSTRAINT_8",
                    "tableName": "PLANET",
                    "type": "P",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.PLANET_TYPE.ID": [
                {
                  "constraint": {
                    "owner": "PUBLIC",
                    "name": "CONSTRAINT_3",
                    "tableName": "PLANET_TYPE",
                    "type": "P",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.SATELLITE.ID": [
                {
                  "constraint": {
                    "owner": "PUBLIC",
                    "name": "CONSTRAINT_4",
                    "tableName": "SATELLITE",
                    "type": "P",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.SPECTRAL_TYPE.ID": [
                {
                  "constraint": {
                    "owner": "PUBLIC",
                    "name": "CONSTRAINT_A",
                    "tableName": "SPECTRAL_TYPE",
                    "type": "P",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.STAR.ID": [
                {
                  "constraint": {
                    "owner": "PUBLIC",
                    "name": "CONSTRAINT_2",
                    "tableName": "STAR",
                    "type": "P",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ]
            }
          },
          "uniqueConstraints" : {
            "columns": {
              "PUBLIC.GALAXY.ID": [
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
              ],
              "PUBLIC.PLANET.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "PLANET",
                    "name": "PRIMARY_KEY_8",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.PLANET_TYPE.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "PLANET_TYPE",
                    "name": "PRIMARY_KEY_3",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.SATELLITE.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "SATELLITE",
                    "name": "PRIMARY_KEY_4",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.SPECTRAL_TYPE.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "SPECTRAL_TYPE",
                    "name": "PRIMARY_KEY_A",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.STAR.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "STAR",
                    "name": "PRIMARY_KEY_2",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ]
            }
          },
          "indexes" : {
            "columns": {
              "PUBLIC.GALAXY.ID": [
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
              ],
              "PUBLIC.PLANET.PLANET_TYPE_FK": [
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
                  "columnsDefinition": "PLANET_TYPE_FK"
                }
              ],
              "PUBLIC.PLANET.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "PLANET",
                    "name": "PRIMARY_KEY_8",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.PLANET.NAME": [
                  {
                    "index": {
                      "owner": "PUBLIC",
                      "tableName": "PLANET",
                      "name": "NAME_INDEX_1",
                      "type": "3",
                      "uniqueness": "f",
                      "columns": "NAME,PLANET_TYPE_FK"
                    },
                    "position": 1,
                    "columnsDefinition": "NAME,PLANET_TYPE_FK" // TODO : check if correct
                  }
              ],
              "PUBLIC.PLANET.PLANET_TYPE_FK": [ // TODO : refaire ces deux indexs dans le SQL et exporter les collections correctement
                  {
                    "index": {
                      "owner": "PUBLIC",
                      "tableName": "PLANET",
                      "name": "PLANET_TYPE_FK_INDEX",
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
              ],
              "PUBLIC.PLANET.STAR_FK": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "PLANET",
                    "name": "CONSTRAINT_INDEX_8",
                    "type": "3",
                    "uniqueness": "f",
                    "columns": "STAR_FK"
                  },
                  "position": 1,
                  "columnsDefinition": "STAR_FK"
                }
              ],
              "PUBLIC.PLANET_TYPE.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "PLANET_TYPE",
                    "name": "PRIMARY_KEY_3",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.SATELLITE.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "SATELLITE",
                    "name": "PRIMARY_KEY_4",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.SPECTRAL_TYPE.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "SPECTRAL_TYPE",
                    "name": "PRIMARY_KEY_A",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.STAR.ID": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "STAR",
                    "name": "PRIMARY_KEY_2",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PUBLIC.STAR.SPECTRAL_TYPE_FK": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "STAR",
                    "name": "CONSTRAINT_INDEX_2",
                    "type": "3",
                    "uniqueness": "f",
                    "columns": "SPECTRAL_TYPE_FK"
                  },
                  "position": 1,
                  "columnsDefinition": "SPECTRAL_TYPE_FK"
                }
              ],
              "PUBLIC.STAR.GALAXY_FK": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "STAR",
                    "name": "CONSTRAINT_INDEX_26",
                    "type": "3",
                    "uniqueness": "f",
                    "columns": "GALAXY_FK"
                  },
                  "position": 1,
                  "columnsDefinition": "GALAXY_FK"
                }
              ]
            },
            "columnsDefinitions": {
              "ID": [
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
                },
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "PLANET",
                    "name": "PRIMARY_KEY_8",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                },
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "PLANET_TYPE",
                    "name": "PRIMARY_KEY_3",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                },
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "SATELLITE",
                    "name": "PRIMARY_KEY_4",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                },
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "SPECTRAL_TYPE",
                    "name": "PRIMARY_KEY_A",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                },
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "STAR",
                    "name": "PRIMARY_KEY_2",
                    "type": "3",
                    "uniqueness": "t",
                    "columns": "ID"
                  },
                  "position": 1,
                  "columnsDefinition": "ID"
                }
              ],
              "PLANET_TYPE_FK": [
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
                  "columnsDefinition": "PLANET_TYPE_FK"
                }
              ],
              "STAR_FK": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "PLANET",
                    "name": "CONSTRAINT_INDEX_8",
                    "type": "3",
                    "uniqueness": "f",
                    "columns": "STAR_FK"
                  },
                  "position": 1,
                  "columnsDefinition": "STAR_FK"
                }
              ],
              "SPECTRAL_TYPE_FK": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "STAR",
                    "name": "CONSTRAINT_INDEX_2",
                    "type": "3",
                    "uniqueness": "f",
                    "columns": "SPECTRAL_TYPE_FK"
                  },
                  "position": 1,
                  "columnsDefinition": "SPECTRAL_TYPE_FK"
                }
              ],
              "GALAXY_FK": [
                {
                  "index": {
                    "owner": "PUBLIC",
                    "tableName": "STAR",
                    "name": "CONSTRAINT_INDEX_26",
                    "type": "3",
                    "uniqueness": "f",
                    "columns": "GALAXY_FK"
                  },
                  "position": 1,
                  "columnsDefinition": "GALAXY_FK"
                }
              ]
            }
          },
          "tables" : {
            "byShortName": {
              "GALAXY": [
                {
                  "shortName": "GALAXY",
                  "fullName": "PUBLIC.GALAXY"
                }
              ],
              "PLANET": [
                {
                  "shortName": "PLANET",
                  "fullName": "PUBLIC.PLANET"
                }
              ],
              "PLANET_TYPE": [
                {
                  "shortName": "PLANET_TYPE",
                  "fullName": "PUBLIC.PLANET_TYPE"
                }
              ],
              "SATELLITE": [
                {
                  "shortName": "SATELLITE",
                  "fullName": "PUBLIC.SATELLITE"
                }
              ],
              "SPECTRAL_TYPE": [
                {
                  "shortName": "SPECTRAL_TYPE",
                  "fullName": "PUBLIC.SPECTRAL_TYPE"
                }
              ],
              "STAR": [
                {
                  "shortName": "STAR",
                  "fullName": "PUBLIC.STAR"
                }
              ]
            },
            "byFullName": {
              "PUBLIC.GALAXY": [
                {
                  "shortName": "GALAXY",
                  "fullName": "PUBLIC.GALAXY"
                }
              ],
              "PUBLIC.PLANET": [
                {
                  "shortName": "PLANET",
                  "fullName": "PUBLIC.PLANET"
                }
              ],
              "PUBLIC.PLANET_TYPE": [
                {
                  "shortName": "PLANET_TYPE",
                  "fullName": "PUBLIC.PLANET_TYPE"
                }
              ],
              "PUBLIC.SATELLITE": [
                {
                  "shortName": "SATELLITE",
                  "fullName": "PUBLIC.SATELLITE"
                }
              ],
              "PUBLIC.SPECTRAL_TYPE": [
                {
                  "shortName": "SPECTRAL_TYPE",
                  "fullName": "PUBLIC.SPECTRAL_TYPE"
                }
              ],
              "PUBLIC.STAR": [
                {
                  "shortName": "STAR",
                  "fullName": "PUBLIC.STAR"
                }
              ]
            }
          }

      };

    let variablesFull = { // TODO : remove
        "variables" : {
                 "source": {
                   "name": "BUBULLE-TEST",
                   "provider": "h2",
                   "currentSchema": "PUBLIC"
                 },
                 "table": {
                   "type": "table",
                   "fullName": "PUBLIC.PLANET",
                   "shortName": "PLANET"
                 },
                 "column": {
                   "fullName": "PUBLIC.PLANET.ID",
                   "shortName": "ID"
                 }
               },
        "collections" : collections,
        "customArrays" : {},
        "customVariables" : {}
    };

    let getVariablesForColumn = function(column) {
        return {
           "variables" : {
                    "source": {
                       "name": "BUBULLE-TEST",
                       "provider": "h2",
                       "currentSchema": "PUBLIC"
                    },
                    "table": {
                       "type": "table",
                       "fullName": "PUBLIC.PLANET",
                       "shortName": "PLANET"
                    },
                    "column": {
                      "fullName": "PUBLIC.PLANET."+column,
                      "shortName": column
                    }
                  },
           "collections" : collections,
           "customArrays" : {},
           "customVariables" : {}
        }
    }

    it("IN operator for primaryKeys", function() {
        let parsedRule = peg.parse("column.fullName in primaryKeys.columns");
        expect(ruleCompute(parsedRule, getVariablesForColumn("STAR_FK"), {"normal": [], "warning": []}))
        .toBe(false);
        expect(ruleCompute(parsedRule, getVariablesForColumn("ID"), {"normal": [], "warning": []}))
        .toBe(true);
    });

    it("IN operator for indexes", function() {
        let parsedRule = peg.parse("column.fullName in indexes.columns");
        expect(ruleCompute(parsedRule, getVariablesForColumn("STAR_FK"), {"normal": [], "warning": []}))
        .toBe(true);
        expect(ruleCompute(parsedRule, getVariablesForColumn("ID"), {"normal": [], "warning": []}))
        .toBe(true);
        expect(ruleCompute(parsedRule, getVariablesForColumn("DESCRIPTION"), {"normal": [], "warning": []}))
        .toBe(false);
    });

    it("IN operator with store in variables as custom array, testing with ==", function() {
        let parsedRule1 = peg.parse("myvar:(column.fullName in indexes.columns)");
        // variable stored as string
        let parsedRule2 = peg.parse("myvar.index.name == 'CONSTRAINT_INDEX_8'");
        let parsedRule2Reverse = peg.parse("'CONSTRAINT_INDEX_8' == myvar.index.name");
        // variable stored as integer
        let parsedRule3 = peg.parse("myvar.position == '1'");
        let parsedRule3Reverse = peg.parse("'1' == myvar.position");

        let variables = getVariablesForColumn("STAR_FK");

        // myvar.index.name is not set yet in variables
        expect(function(){ ruleCompute(parsedRule2, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.index.name is undefined"));
        expect(function(){ ruleCompute(parsedRule2Reverse, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.index.name is undefined"));
        expect(function(){ ruleCompute(parsedRule3, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.position is undefined"));
        expect(function(){ ruleCompute(parsedRule3Reverse, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.position is undefined"));

        expect(ruleCompute(parsedRule1, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // now myvar.index.name exists
        expect(ruleCompute(parsedRule2, variables, {"normal": [], "warning": []}))
        .toBe(true);
        expect(ruleCompute(parsedRule2Reverse, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // now myvar.position exists
        expect(ruleCompute(parsedRule3, variables, {"normal": [], "warning": []}))
        .toBe(true);
        expect(ruleCompute(parsedRule3Reverse, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // others inexistence tests
        expect(function(){ ruleCompute(peg.parse("myvar.undefined == '1'"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.undefined is undefined"));
        expect(function(){ ruleCompute(peg.parse("undefined == '1'"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("undefined is undefined"));
        expect(function(){ ruleCompute(peg.parse("'1' == myvar.undefined"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.undefined is undefined"));
        expect(function(){ ruleCompute(peg.parse("'1' == undefined"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("undefined is undefined"));

    });

    it("IN operator with store in variables as custom array, testing with !=", function() {
        let parsedRule1 = peg.parse("myvar:(column.fullName in indexes.columns)");
        // variable stored as string
        let parsedRule2 = peg.parse("myvar.index.name != 'CONSTRAINT_INDEX_8'");
        let parsedRule2Reverse = peg.parse("'CONSTRAINT_INDEX_8' != myvar.index.name");
        // variable stored as integer
        let parsedRule3 = peg.parse("myvar.position != '1'");
        let parsedRule3Reverse = peg.parse("'1' != myvar.position");

        let variables = getVariablesForColumn("STAR_FK");

        // myvar.index.name is not set yet in variables
        expect(function(){ ruleCompute(parsedRule2, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.index.name is undefined"));
        expect(function(){ ruleCompute(parsedRule2Reverse, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.index.name is undefined"));
        expect(function(){ ruleCompute(parsedRule3, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.position is undefined"));
        expect(function(){ ruleCompute(parsedRule3Reverse, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.position is undefined"));

        expect(ruleCompute(parsedRule1, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // now myvar.index.name exists
        expect(ruleCompute(parsedRule2, variables, {"normal": [], "warning": []}))
        .toBe(false);
        expect(ruleCompute(parsedRule2Reverse, variables, {"normal": [], "warning": []}))
        .toBe(false);

        // now myvar.position exists
        expect(ruleCompute(parsedRule3, variables, {"normal": [], "warning": []}))
        .toBe(false);
        expect(ruleCompute(parsedRule3Reverse, variables, {"normal": [], "warning": []}))
        .toBe(false);

        // others inexistence tests
        expect(function(){ ruleCompute(peg.parse("myvar.undefined != '1'"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.undefined is undefined"));
        expect(function(){ ruleCompute(peg.parse("undefined != '1'"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("undefined is undefined"));
        expect(function(){ ruleCompute(peg.parse("'1' != myvar.undefined"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.undefined is undefined"));
        expect(function(){ ruleCompute(peg.parse("'1' != undefined"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("undefined is undefined"));

    });

    it("IN operator with store in variables as custom array, testing with LIKE", function() {
        let parsedRule1 = peg.parse("myvar:(column.fullName in indexes.columns)");
        // variable stored as string
        let parsedRule2 = peg.parse("myvar.index.name LIKE 'CONSTRAINT_INDEX.*'");
        // variable stored as integer
        let parsedRule3 = peg.parse("myvar.position LIKE '\\d+'");
        // regex that does not match
        let parsedRule4 = peg.parse("myvar.position LIKE '[a-z]+'");

        let variables = getVariablesForColumn("STAR_FK");

        // myvar.index.name is not set yet in variables
        expect(function(){ ruleCompute(parsedRule2, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.index.name is undefined"));
        expect(function(){ ruleCompute(parsedRule3, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.position is undefined"));
        expect(function(){ ruleCompute(parsedRule4, variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.position is undefined"));

        expect(ruleCompute(parsedRule1, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // now myvar.index.name exists
        expect(ruleCompute(parsedRule2, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // now myvar.position exists
        expect(ruleCompute(parsedRule3, variables, {"normal": [], "warning": []}))
        .toBe(true);
        expect(ruleCompute(parsedRule4, variables, {"normal": [], "warning": []}))
        .toBe(false);

        // others inexistence tests
        expect(function(){ ruleCompute(peg.parse("myvar.undefined LIKE 'TEST.*'"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("myvar.undefined is undefined"));
        expect(function(){ ruleCompute(peg.parse("undefined LIKE 'TEST.*'"), variables, {"normal": [], "warning": []})})
        .toThrow(new Error("undefined is undefined"));

    });

    it("IN operator with store in variables as custom array with 2 occurences, testing with ==", function() {
        let parsedRule1 = peg.parse("myvar:(column.fullName in indexes.columns)");
        // variable matching 2 different values : will throw exception
        let parsedRule2 = peg.parse("myvar.index.name == 'PLANET_TYPE_FK_INDEX'");
        let parsedRule2Reverse = peg.parse("'PLANET_TYPE_FK_INDEX' == myvar.index.name");
        // variable matching 2 equal values : will throw exception
        let parsedRule3 = peg.parse("myvar.index.tableName == 'PLANET'");
        let parsedRule3Reverse = peg.parse("'PLANET' == myvar.index.tableName");

        let variables = getVariablesForColumn("PLANET_TYPE_FK");

        // initializes myvar.index.name
        expect(ruleCompute(parsedRule1, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // now myvar.index.name exists
        expect(function(){ ruleCompute(parsedRule2, variables, {"normal": [], "warning": []}) })
        .toThrow(new Error("different values are found for left value in == or != test myvar.index.name"));
        expect(function(){ ruleCompute(parsedRule2Reverse, variables, {"normal": [], "warning": []}) })
        .toThrow(new Error("different values are found for right value in == or != test myvar.index.name"));

        // now myvar.index.tableName exists. there is two occurences, but each value is the same and equal to 'PLANET'
        expect(ruleCompute(parsedRule3, variables, {"normal": [], "warning": []}))
        .toBe(true);
        expect(ruleCompute(parsedRule3Reverse, variables, {"normal": [], "warning": []}))
        .toBe(true);
    });

    it("IN operator with store in variables as custom array with 2 occurences, testing with !=", function() {
        let parsedRule1 = peg.parse("myvar:(column.fullName in indexes.columns)");
        // variable matching 2 different values : will throw exception
        let parsedRule2 = peg.parse("myvar.index.name != 'PLANET_TYPE_FK_INDEX'");
        let parsedRule2Reverse = peg.parse("'PLANET_TYPE_FK_INDEX' != myvar.index.name");
        // variable matching 2 equal values : will throw exception
        let parsedRule3 = peg.parse("myvar.index.tableName != 'PLANET'");
        let parsedRule3Reverse = peg.parse("'PLANET' != myvar.index.tableName");

        let variables = getVariablesForColumn("PLANET_TYPE_FK");

        // initializes myvar.index.name
        expect(ruleCompute(parsedRule1, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // now myvar.index.name exists
        expect(function(){ ruleCompute(parsedRule2, variables, {"normal": [], "warning": []}) })
        .toThrow(new Error("different values are found for left value in == or != test myvar.index.name"));
        expect(function(){ ruleCompute(parsedRule2Reverse, variables, {"normal": [], "warning": []}) })
        .toThrow(new Error("different values are found for right value in == or != test myvar.index.name"));

        // now myvar.index.tableName exists. there is two occurences, but each value is the same and equal to 'PLANET'
        expect(ruleCompute(parsedRule3, variables, {"normal": [], "warning": []}))
        .toBe(false);
        expect(ruleCompute(parsedRule3Reverse, variables, {"normal": [], "warning": []}))
        .toBe(false);
    });

    it("IN operator with store in variables as custom array with 2 occurences, testing with LIKE", function() {
        let parsedRule1 = peg.parse("myvar:(column.fullName in indexes.columns)");
        // variable matching 2 different values : OK only if regex matches every values
        let parsedRule2 = peg.parse("myvar.index.name LIKE 'PLANET_TYPE_FK_(.*)'");
        // variable matching 2 equal values : OK only if regex matches the value
        let parsedRule3 = peg.parse("myvar.index.tableName LIKE 'PLANET'");
        // variable matching 2 equal values, capturing a group
        let parsedRule4 = peg.parse("mycapture:(myvar.index.tableName LIKE 'PLA(.*)')");

        let variables = getVariablesForColumn("PLANET_TYPE_FK");

        // initializes myvar.index.name
        expect(ruleCompute(parsedRule1, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // now myvar.index.name exists
        expect(ruleCompute(parsedRule2, variables, {"normal": [], "warning": []}))
        .toBe(false);

        // now myvar.index.tableName exists. there is two occurences, but each value is the same and equal to 'PLANET'
        expect(ruleCompute(parsedRule3, variables, {"normal": [], "warning": []}))
        .toBe(true);

        // test that group capture works
        expect(ruleCompute(parsedRule4, variables, {"normal": [], "warning": []}))
        .toBe(true);
        expect(ruleCompute(peg.parse("mycapture.group1 == 'NET,NET'"), variables, {"normal": [], "warning": []}))
        .toBe(true);
    });
});