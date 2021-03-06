describe("eyeshine variable string computation", function() {

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

    it("common variable string computation for indexes", function() {
        let variables = getVariablesForColumn("STAR_FK");

        expect(computeVariableString(getVariableStringParts(pegVariables, "Indexed by ${indexes.columns[column.fullName].index.owner}.${indexes.columns[column.fullName].index.name} (position in index : #${indexes.columns[column.fullName].position})"), variables))
        .toBe('Indexed by PUBLIC.CONSTRAINT_INDEX_8 (position in index : #1)');

        // the same using a stored variable
        expect(ruleCompute(peg.parse("myIndex:(column.fullName in indexes.columns)"), variables, {"normal": [], "warning": []}))
        .toBe(true);

        expect(computeVariableString(getVariableStringParts(pegVariables, "Indexed by ${myIndex.index.owner}.${myIndex.index.name} (position in index : #${myIndex.position})"), variables))
        .toBe('Indexed by PUBLIC.CONSTRAINT_INDEX_8 (position in index : #1)');
    });

    it("common variable string computation for primary keys", function() {
        let variables = getVariablesForColumn("ID");

        // first we need to have a matching rule to store the pkColumn variable
        expect(ruleCompute(peg.parse("pkColumn:(column.fullName in primaryKeys.columns)"), variables, {"normal": [], "warning": []}))
        .toBe(true);

        expect(computeVariableString(getVariableStringParts(pegVariables, "Primary Key (constraint(s) : ${pkColumn.constraint.name}, column position in PK : ${pkColumn.position})"), variables))
        .toBe('Primary Key (constraint(s) : CONSTRAINT_8, column position in PK : 1)');

    });

    it("use computeVariableString to return an array of 1 element", function() {
        let variables = getVariablesForColumn("STAR_FK");

        expect(computeVariableString(getVariableStringParts(pegVariables, "Indexed by ${indexes.columns[column.fullName].index.owner}.${indexes.columns[column.fullName].index.name} (position in index : #${indexes.columns[column.fullName].position})"),
                variables))
        .toBe('Indexed by PUBLIC.CONSTRAINT_INDEX_8 (position in index : #1)');
        expect(computeVariableString(getVariableStringParts(pegVariables, "Indexed by ${indexes.columns[column.fullName].index.owner}.${indexes.columns[column.fullName].index.name} (position in index : #${indexes.columns[column.fullName].position})"),
                variables,
                true))
        .toEqual( [ 'Indexed by PUBLIC.CONSTRAINT_INDEX_8 (position in index : #1)' ] );
    });

    it("use computeVariableString to return an array of 2 element", function() {
        let variables = getVariablesForColumn("PLANET_TYPE_FK");

        expect(computeVariableString(getVariableStringParts(pegVariables, "Indexed by ${indexes.columns[column.fullName].index.owner}.${indexes.columns[column.fullName].index.name} (position in index : #${indexes.columns[column.fullName].position})"),
                variables))
        .toBe('Indexed by PUBLIC, PUBLIC.PLANET_TYPE_FK_INDEX, NAME_INDEX_1 (position in index : #1, 2)');
        expect(computeVariableString(getVariableStringParts(pegVariables, "Indexed by ${indexes.columns[column.fullName].index.owner}.${indexes.columns[column.fullName].index.name} (position in index : #${indexes.columns[column.fullName].position})"),
                variables,
                true))
        .toEqual( [
        // TODO : ici on devrait retourner seulement les deux elements en commentaires. il faudrait eviter de retourner toutes les combinaisons possibles, mais seulement les combinaisons pertinentes
        //    'Indexed by PUBLIC.PLANET_TYPE_FK_INDEX (position in index : #1)',
        //    'Indexed by PUBLIC.NAME_INDEX_1 (position in index : #2)'

            'Indexed by PUBLIC.PLANET_TYPE_FK_INDEX (position in index : #1)',
            'Indexed by PUBLIC.PLANET_TYPE_FK_INDEX (position in index : #2)',
            'Indexed by PUBLIC.NAME_INDEX_1 (position in index : #1)',
            'Indexed by PUBLIC.NAME_INDEX_1 (position in index : #2)',
            'Indexed by PUBLIC.PLANET_TYPE_FK_INDEX (position in index : #1)',
            'Indexed by PUBLIC.PLANET_TYPE_FK_INDEX (position in index : #2)',
            'Indexed by PUBLIC.NAME_INDEX_1 (position in index : #1)',
            'Indexed by PUBLIC.NAME_INDEX_1 (position in index : #2)'
        ] );
    });

});