describe("eyeshine rule parsing", function() {

    it("IN operator with store in variable", function() {
        expect(peg.parse("pkColumn:(column.fullName in primaryKeys.columns)"))
        .toEqual({
           "operator": "IN",
           "left": {
             "name": true,
             "value": "column.fullName"
           },
           "right": {
             "name": true,
             "value": "primaryKeys.columns"
           },
           "storeResultInVariable": "pkColumn"
         });
    });

    it("IN operator without store in variable", function() {
        expect(peg.parse("column.fullName in primaryKeys.columns"))
        .toEqual({
           "operator": "IN",
           "left": {
             "name": true,
             "value": "column.fullName"
           },
           "right": {
             "name": true,
             "value": "primaryKeys.columns"
           }
         });
    });

    it("LABELLED operator", function() {
        expect(peg.parse("LABELLED 'PK'"))
        .toEqual({
              "operator": "LABELLED",
              "label": "PK"
        })
    });

    it("NOT operator", function() {
        expect(peg.parse("NOT LABELLED 'PK'"))
        .toEqual({
            "operator": "NOT",
            "expression": {
              "operator": "LABELLED",
              "label": "PK"
            }
        })
    });

    it("AND operator", function() {
        expect(peg.parse("column.fullName IN uniqueConstraints.columns AND NOT LABELLED 'PK'"))
        .toEqual({
          "operator": "AND",
          "left": {
            "operator": "IN",
            "left": {
              "name": true,
              "value": "column.fullName"
            },
            "right": {
              "name": true,
              "value": "uniqueConstraints.columns"
            }
          },
          "right": {
            "operator": "NOT",
            "expression": {
              "operator": "LABELLED",
              "label": "PK"
            }
          }
        })
    });

    it("LIKE operator with single quotes", function() {
        expect(peg.parse("column.shortName LIKE '(.*)_FK'"))
        .toEqual({
             "operator": "LIKE",
             "left": {
               "name": true,
               "value": "column.shortName"
             },
             "right": {
               "literal": true,
               "value": "(.*)_FK"
             }
           })
    });

    it("LIKE operator with double quotes", function() {
        expect(peg.parse('column.shortName LIKE "(.*)_FK"'))
        .toEqual({
             "operator": "LIKE",
             "left": {
               "name": true,
               "value": "column.shortName"
             },
             "right": {
               "literal": true,
               "value": "(.*)_FK"
             }
           })
    });

    it("LIKE operator with store in variables", function() {
        expect(peg.parse("prefix:(column.shortName LIKE '(.*)_FK')"))
        .toEqual({
             "operator": "LIKE",
             "left": {
               "name": true,
               "value": "column.shortName"
             },
             "right": {
               "literal": true,
               "value": "(.*)_FK"
             },
             "storeResultInVariable": "prefix"
           })
    });

    it("first foreign key candidate rule", function() {
        expect(peg.parse("prefix:(column.shortName LIKE '(.*)_FK') AND NOT LABELLED 'FK' AND prefix.group1 IN tables.byShortName"))
        .toEqual({
           "operator": "AND",
           "left": {
             "operator": "LIKE",
             "left": {
               "name": true,
               "value": "column.shortName"
             },
             "right": {
               "literal": true,
               "value": "(.*)_FK"
             },
             "storeResultInVariable": "prefix"
           },
           "right": {
             "operator": "AND",
             "left": {
               "operator": "NOT",
               "expression": {
                 "operator": "LABELLED",
                 "label": "FK"
               }
             },
             "right": {
               "operator": "IN",
               "left": {
                 "name": true,
                 "value": "prefix.group1"
               },
               "right": {
                 "name": true,
                 "value": "tables.byShortName"
               }
             }
           }
         })
    });

    it("second foreign key candidate rule", function() {
        expect(peg.parse("column.fullName LIKE '.*_FK' AND NOT LABELLED 'FK' AND NOT LABELLED 'FK??'"))
        .toEqual({
           "operator": "AND",
           "left": {
             "operator": "LIKE",
             "left": {
               "name": true,
               "value": "column.fullName"
             },
             "right": {
               "literal": true,
               "value": ".*_FK"
             }
           },
           "right": {
             "operator": "AND",
             "left": {
               "operator": "NOT",
               "expression": {
                 "operator": "LABELLED",
                 "label": "FK"
               }
             },
             "right": {
               "operator": "NOT",
               "expression": {
                 "operator": "LABELLED",
                 "label": "FK??"
               }
             }
           }
        })
    });

    it("index candidate for foreign keys rule", function() {
       expect(peg.parse("column.fullName IN foreignKeys.columns AND NOT column.fullName IN indexes.columns"))
       .toEqual({
          "operator": "AND",
          "left": {
            "operator": "IN",
            "left": {
              "name": true,
              "value": "column.fullName"
            },
            "right": {
              "name": true,
              "value": "foreignKeys.columns"
            }
          },
          "right": {
            "operator": "NOT",
            "expression": {
              "operator": "IN",
              "left": {
                "name": true,
                "value": "column.fullName"
              },
              "right": {
                "name": true,
                "value": "indexes.columns"
              }
            }
          }
       })
    });

});