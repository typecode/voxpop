if(!tc){ var tc = {}; }

(function(tc){
  if(!tc.voxpop){ tc.voxpop = {}; }
  tc.voxpop.word_highlighter = function(node,values){
    var regex;
    
    if(values.positive){
        for(var i in values.positive){
          regex = new RegExp(values.positive[i]+"\\b", 'gi');
          node._node.innerHTML = node._node.innerHTML.replace(
            regex,
            "<span style='color:green;'>"+values.positive[i]+"</span>"
          );
        }
      }
      if(values.negative){
        for(var i in values.negative){
          regex = new RegExp(values.negative[i]+"\\b", 'gi');
          node._node.innerHTML = node._node.innerHTML.replace(
            regex,
            "<span style='color:red;'>"+values.negative[i]+"</span>"
          );
        }
      }
    
    return node;
  }
})(tc);