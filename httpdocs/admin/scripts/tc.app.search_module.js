if(!tc){ var tc = {}; }

(function(tc){
tc.search_module = function(app){
  var _me, _domRef;
  _me = this;
 
  this.template =  "<div class='clearfix' id='search_module'>\
    <form id='search_form' action='/vp/query/articles'>\
      <label for='search'>Search Query</search>\
      <input type='text' name='query' id='search'></textarea>\
      <a href='#' class='button' id='text-submit-button'>Submit</a>\
    </form>\
  </div>";
 
   this.initialize = function(){
     console.log('search_module.initialize');
     app.Y.augment(_me, app.Y.EventTarget, null, null, {});
     return _me;
   }
 
   this.render = function(selector){
     console.log('search_module.appendTo');
     if(!selector){ selector = app.selector; }
     app.Y.one(selector).append(_me.template);
     _domRef = app.Y.one("#search_module");
     _domRef.one('#text-submit-button')
      .on('click',_me.textSubmitClickHandler);
    _domRef.one('input').on('keypress',_me.textareakeypresshandler)
    return _me;
   }
 
  this.textSubmitClickHandler = function(e){
    console.log('search_module.responseSubmitButtonClickHandler');
    var _data;
    _data = {};
    _domRef.all('input').each(function(node,index,list){
      _data[node.get('name')] = node.get('value');
    });
    app.Y.io(_domRef.one('#search_form').get('action'),
      { method:"POST",
        data:app.Y.JSON.stringify(_data),
        on:{
          success:function(transactionId, response, arguments){
            var json;
            try{
              json = app.Y.JSON.parse(response.responseText);
            }catch(error){
              console.log(error);
            }
            console.log(json);
          }
        }
      }
    );
  }
 
  this.textareakeypresshandler = function(e){
    console.log(e.which);
    if(e.which == 13){
      e.preventDefault();
      _domRef.one('#text-submit-button').simulate('click');
    }
  }
 
  return this.initialize();
}
})(tc);