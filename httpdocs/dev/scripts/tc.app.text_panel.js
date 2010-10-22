if(!tc){ var tc = {}; }

(function(tc){
tc.text_panel = function(app){
  var _me, _domRef;
  _me = this;
 
  this.template =  "<div id='text_panel'>\
    <form id='text_form' action=''>\
      <textarea name='text'></textarea>\
      <a href='#' class='button' id='text-submit-button'>Submit</a>\
    </form>\
    <div class='clear'></div>\
      <p></p>\
    <div class='clear'></div>\
  </div>";
 
   this.initialize = function(){
     console.log('text_panel.initialize');
     app.Y.augment(_me, app.Y.EventTarget, null, null, {});
     return _me;
   }
 
   this.render = function(selector){
     console.log('text_panel.appendTo');
     if(!selector){ selector = app.selector; }
     app.Y.one(selector).append(_me.template);
     _domRef = app.Y.one("#text_panel");
     _domRef.one('#text-submit-button')
      .on('click',_me.textSubmitClickHandler);
    _domRef.one('textarea').on('keypress',_me.textareakeypresshandler)
   }
 
  this.textSubmitClickHandler = function(e){
    console.log('text_panel.responseSubmitButtonClickHandler');
    var _data;
    _data = {
      text: _domRef.one('textarea')._node.value
    }
    if(!_data.text.length){ return false; }
    _domRef.one('p')._node.innerHTML = "";
    app.Y.io('/vp/text/',
      { method:"POST",
        data:app.Y.JSON.stringify(_data),
        on:{
          success:function(transactionId, response, arguments){
            var json;
            try{
              _domRef.one('textarea')._node.value = "";
              
              json = app.Y.JSON.parse(response.responseText);
              _domRef.one('p').insert(app.Y.JSON.stringify(json.input,null,'&nbsp;'));
              tc.voxpop.word_highlighter(
                _domRef.one('p'),
                json.output.lasswell_words
              );
            }catch(error){
              console.log(error);
            }
          }
        }
      }
    );
  }
 
  this.textareakeypresshandler = function(e){
    console.log(e.which);
    if(e.which == 13){
      _domRef.one('#text-submit-button').simulate('click');
    }
  }
 
  return this.initialize();
}
})(tc);