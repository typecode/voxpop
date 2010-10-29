if(!tc){ var tc = {}; }

(function(tc){
  tc.user_manager = function(app){
    var _me;
    _me = this;
    
    this.templates = {
      login:"<div id='login' class='modal-form'></div><div id='social_auth'></div>",
      register:"<div id='register' class='modal-form'></div><div id='social_auth'></div>"
    }
    
    this.initialize = function(){
      console.log('user_manager.initialize');
      app.Y.augment(_me, app.Y.EventTarget, null, null, {});
      this.setup_events();
      return _me;
    }
    
    this.setup_events = function(){
      console.log('user_manager.setup_events');
      app.on('header:loginButtonClicked',_me.loginButtonClickedHandler)
      app.on('header:registerButtonClicked',_me.registerButtonClickedHandler)
    }
    
    this.fetch_user = function(){
      console.log('user_manager.fetch_user');
      app.Y.io('/user',
        {on:{
          success:function(transactionId, response, arguments){
            try{
              var _json = app.Y.JSON.parse(response.responseText);
              console.log(_json);
              if(_json.salt){ app.salt = _json.salt; }
              app.fire('user_manager:user_fetched',_json);
            }catch(error){
              console.log(error);
            }
          }
        }}
      );
    }
    
    this.logged_in = function(){
      console.log('user_manager.logged_in');
      return false;
    }
    
    this.show_login_form = function(){
      console.log('user_manager.show_login_form');
      app.modal.setStdModContent('body','FORM');
    }
    
    this.loginButtonClickedHandler = function(){
      console.log('user_manager.loginButtonClickedHandler');
      var loginform, submitclick, resetclick;
      loginform = new app.Y.Form({
        method : "post",
        action : "/user/login",
        encodingType : app.Y.Form.URL_ENCODED,
        inlineValidation : true,
        fields : [
          {name : 'email', type : 'text', label : 'Username'},
          {name : 'password', type : 'password', label : 'Password'},
          {name : 'submit', type : 'button', label : 'Submit'},
          {name : 'reset', type : 'button', label : 'Reset'}
        ]
      });
      app.modal.once('modal:modalClosed',function(e){
        loginform.destroy();
        app.Y.detach(submitclick);
        app.Y.detach(resetclick);
      })
      app.modal.show("Login",_me.templates.login);
      loginform.render('#login');
      submitclick = loginform.getField('submit').on('click',function(e){
        loginform.getField('email').get('value');
        loginform.getField('password').get('value');
      });
      resetclick = loginform.getField('reset').on('click',function(e){
        loginform.getField('email').set('value',"");
        loginform.getField('password').set('value',"");
      });
    }
    
    this.registerButtonClickedHandler = function(){
      console.log('user_manager.registerButtonClickedHandler');
      var registerform, submitclick, resetclick;
      registerform = new app.Y.Form({
        method : "post",
        action : "/user/register",
        encodingType : app.Y.Form.URL_ENCODED,
        inlineValidation : true,
        fields : [
          {name : 'email', type : 'text', label : 'Email', validator:'email'},
          {name : 'password', type : 'password', label : 'Password'},
          {name : 'password2', type : 'password', label : 'Password Again'},
          {name : 'submit', type : 'button', label : 'Submit'},
          {name : 'reset', type : 'button', label : 'Reset'}
        ]
      });
      app.modal.once('modal:modalClosed',function(e){
        registerform.destroy();
        app.Y.detach(submitclick);
        app.Y.detach(resetclick);
      })
      app.modal.show("Register",_me.templates.register);
      registerform.render('#register');
      submitclick = registerform.getField('submit').on('click',function(e){
        var e, p1, p2;
        e = registerform.getField('email').get('value');
        p1 = registerform.getField('password').get('value');
        p2 = registerform.getField('password2').get('value');
        if(p1 !== p2){
          return false;
        }
        
        
        app.Y.io('/user/register',
          { method:'POST',
            data: app.Y.JSON.stringify({email:e,passhash:hex_hmac_md5(p1,app.salt)}),
            on:{
            success:function(transactionId, response, arguments){
              try{
                var _json = app.Y.JSON.parse(response.responseText);
                console.log(_json);
                if(_json.salt){ app.salt = _json.salt; }
                app.fire('user_manager:user_fetched',_json);
              }catch(error){
                console.log(error);
              }
            }
          }}
        );
        
      });
      resetclick = registerform.getField('reset').on('click',function(e){
        registerform.getField('email').set('value',"");
        registerform.getField('password').set('value',"");
      });
      
    }
    
    return this.initialize();
  }
})(tc);