E
  = E1
 
E1
  = e:(CollectionItem/NameOrLiteral) n:(space? "\." space? E1)?
  { 
    if(!n) {
        return { "expr":e };
    }
    return { "expr":e, "next":n[3] }; 
  }

CollectionItem
  = n:Name space? "[" space? i:E1 space? "]"
  { return { "collection":n, "index":i }; }
  
NameOrLiteral
  = Name
  / Literal
  
Name 
  = w:([a-zA-Z0-9_]+) 
  { return { "name":true, "value":w.join("") }; }
  
Literal 
  = "\"" w:([^\"]+) "\""
  { return { "literal":true, "value":w.join("") }; }
  / "'" w:([^\']+) "'"
  { return { "literal":true, "value":w.join("") }; }
  
space = [ \t\n\r]+ 
