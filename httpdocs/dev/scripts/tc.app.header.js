if(!tc){ var tc = {}; }

(function(tc){
  tc.header = function(app){
    var _me, _domRef;
    _me = this;
    
    this.templates = {
      base: "<div id='header'><a href='#' class='login'>LOGIN</a><a href='#' class='register'>REGISTER</a></div>"
    }
    
    this.initialize = function(){
      return _me;
    }
    
    this.render = function(selector){
      console.log('header.appendTo');
      if(!selector){ selector = app.selector; }
      app.Y.one(selector).append(_me.templates.base);
      _domRef = app.Y.one("#header");
      this.postRender();
    }
    
    this.postRender = function(){
      console.log('header.postRender');
      _domRef.one('a.login').on('click',_me.loginButtonClickHandler);
      _domRef.one('a.register').on('click',_me.registerButtonClickHandler);
    }
    
    this.loginButtonClickHandler = function(e){
      console.log('header.loginButtonClickHandler');
      e.preventDefault();
      app.fire('header:loginButtonClicked');
    }
    
    this.registerButtonClickHandler = function(e){
      console.log('header.registerButtonClickHandler');
      e.preventDefault();
      app.fire('header:registerButtonClicked');
    }
    
    return this.initialize();
  }
})(tc);