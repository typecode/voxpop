/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.fn.topic = function(options){
		var ts, _o, _data, _disp, _context, _name
		
		ts = this
		_o = vp.jQ.extend({
			
		},options)
		
		ts.getDisplay = function(d){
			if(_disp != null){
				_context.start()
				return _disp
			}
		}
		
		ts.cleanup = function(){
			_context.pause()
		}
		
		function _initialize(){
			vp.util.log("VoxPop Topic Starting",'info')
			if(typeof _o.name == 'undefined'){
				vp.util.log("VoxPop Topic Not Started, No Topic",'info')
				return false
			}
			_setup_events()
			_name = _o.name
			_articles = {}
			_disp = null
			_context = null
			_construct_display()
			_load_topic()
			return ts
		}
		
		function _setup_events(){
			
		}
		
		function _construct_display(cb){
			_disp = vp.jQ("<div class='topic'></div>")
			_context = vp.jQ("<canvas></canvas>").particleContext({})
			_context.attr("width",vp.jQ(window).width()-15)
			_context.attr("height",vp.jQ(window).height()-15)
			_context.css("margin",'auto')
			_attractor = _context.add_global_force({x: vp.jQ(document).width()/2, y:vp.jQ(document).height()/2}, 0.5, 500)
			_disp.append(_context)
		}
		
		function _load_topic(){
			function callback(d, ts){
				vp.console.printToConsole("Loaded Cached Articles for Topic: "+_name)
				_data = d
				//for(var i = 0; i < _data.cached.length; i++){
				for(var i in _data.cached){
					var __pos = {x: vp.util.rand(((_disp.width()/2)-100),((_disp.width()/2)+100)), y:vp.util.rand(((_disp.height()/2)-100),((_disp.height()/2)+100))}
					var __color = vp.util.colorFade("0x66B2CC","0xF7ED4F",vp.util.rand(0,1)).toString(16)
					var __myParticle = new vp.fn.particle({pos:__pos, radius: 10, text: _data.cached[i].title, color:__color})
					vp.util.dump(__myParticle)
					_context.add_particle(__myParticle)
				}
			}
			function errorCallback(xhr, ts, ec){
				
			}
			vp.resources.getResource("/articles/by_topic/"+_name, {}, callback, errorCallback)
		}
		
		return _initialize()
	}
})(vp);