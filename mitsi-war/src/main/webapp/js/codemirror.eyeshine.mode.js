// TODO : rajouter les strings, les ${} etc. et en faire un autre pour les commentaires aussi

var keywords = ["like", "in", "and", "or", "labelled", "not"];

CodeMirror.defineMode("eyeshine", function() {

  return {
    token: function(stream) {
      let c = stream.peek();
      if (c == "'") {
        stream.next();
        stream.eatWhile(/[^']/);
        if (stream.next() != "'") {
            return "eyeshine-code-error";
        }
        return "eyeshine-code-string";
      }
      if (c == '"') {
        stream.next();
        stream.eatWhile(/[^"]/);
        if (stream.next() != '"') {
            return "eyeshine-code-error";
        }
        return "eyeshine-code-string";
      }

      stream.eatWhile(/\w/);

      let lower = stream.current().toLowerCase();
      if (keywords.indexOf(lower) > -1) {
        return "eyeshine-code-keyword";
      }
      stream.next();
    }
  };

});

