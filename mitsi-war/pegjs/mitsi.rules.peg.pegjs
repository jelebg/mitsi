
E  
  =E1

E1
  = expression:E2 rest:( space "OR"i space (E2/E1))*
    { if (!rest || rest.length == 0) return expression;
      let ret = { "operator" : "OR", "left":expression, "right":rest[0][3] }; 
      
      for(let i=1; i<rest.length; i++) {
        ret = { "operator" : "OR", "left":ret, "right":rest[i][3] };
      }
      return ret;
    }

E2
  = l:Expression r:(space "AND"i space E2)?
    { if (!r) return l;
      return { "operator" : "AND", "left":l, "right":r[3]}
    }
    
Condition 
  = w1:NameOrLiteral space? o:Operator space? w2:NameOrLiteral
  {
    return { "operator" : o.toUpperCase(), "left":w1, "right":w2}
  }

ValuedCondition
  = thevar:Name space? ":" space? "(" space? cond:Condition space? ")"
  {
    cond.storeResultInVariable = thevar.value;
    return cond;
  }
  
Expression
  = Negation
  / BracketedExpression
  / ValuedCondition
  / Condition
  / Labelled
  
Labelled
  = "LABELLED"i space l:Literal
  { return { "operator":"LABELLED", label:l.value }; }

BracketedExpression
  = "(" space? expression:E1 space? ")"
    { return expression; }

Negation
 = "NOT"i space? e:Expression 
    { return { "operator":"NOT", "expression":e }; }

Operator
  = "==" / "!=" / "IN"i / "LIKE"i

NameOrLiteral
  = Name
  / Literal
  
Name 
  = w:([a-zA-Z0-9\._]+) 
  { return { "name":true, "value":w.join("") }; }
  
Literal 
  = "\"" w:([^\"]+) "\""
  { return { "literal":true, "value":w.join("") }; }
  / "'" w:([^\']+) "'"
  { return { "literal":true, "value":w.join("") }; }
  
space = [ \t\n\r]+ 


