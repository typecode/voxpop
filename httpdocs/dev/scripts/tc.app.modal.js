if(!tc){ var tc = {}; }

(function(tc){
  tc.modal = function(app){
    var _me, _domRef, _widget;
    _me = this;
    
    this.templates = {
      header: "<a href='#' class='close'>CLOSE</a>"
    }
    
    this.initialize = function(){
      app.Y.augment(_me, app.Y.EventTarget, null, null, {});
      _widget = new app.Y.Overlay({ id:'modal', width:500, x: window.outerWidth/2-250, y: 100 });
      return _me;
    }
    
    this.render = function(selector){
      console.log('modal.appendTo');
      if(!selector){ selector = app.selector; }
      _widget.setStdModContent('header',this.templates.header);
      _widget.render(selector).hide();
      _domRef = app.Y.one('#modal');
      _domRef.one('a.close').on('click',_me.hide);
    }
    
    this.hide = function(){
      console.log('modal.hide');
      _me.fire('modal:modalClosed');
      _widget.hide();
    }
    
    this.show = function(title,content){
      console.log('modal.show');
      _widget.setStdModContent('header',"<p>"+title+"</p>"+this.templates.header);
      _domRef.one('a.close').on('click',_me.hide);
      _widget.setStdModContent('body',content);
      _widget.show();
    }
    
    return this.initialize();
  }
})(tc);