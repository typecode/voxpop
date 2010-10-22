if(!tc){ tc = {}; }

var environment = {
  cloudmade:{
    api_key:null
  }
}

var app = {
    Y:null,
    selector:'#app',
    name:'voxpop-dev',
    version:0.1,
    openPolls:{},
    salt:123456789,
    text_panel:null,
  }
  
  app.initialize = function(Y){
    console.log('app.initialize');
    app.Y = Y;
    app.Y.Node.one('title').setContent(app.name+" - "+app.version);
    app.setupevents();
    app.text_panel = new tc.text_panel(app);
    app.text_panel.render(app.selector);
  }
  
  app.setupevents = function(){
    console.log('app.setupevents');
    app.Y.augment(app,app.Y.EventTarget);
  }

  