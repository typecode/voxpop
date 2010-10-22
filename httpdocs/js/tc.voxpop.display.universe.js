/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config['universe'] = {}
	vp.config.universe['title'] = "Popular Topics of Conversation"
	vp.config.universe['subtitle'] = "On The New York Times Website"
	
	vp.fn.universe = function(options){
		var t, _o, _disp, _context, _attractor, _data
		
		t = this
		_o = vp.jQ.extend({
			min_radius:35,
			max_radius:90
		},options)
		
		t.getDisplay = function(d){
			if(_disp != null){
				vp.events.unbind("windowResize").bind("windowResize",_windowResizeEventHandler)
				vp.events.unbind("particleMouseOver").bind("particleMouseOver",_particleMouseOverEventHandler)
				vp.events.unbind("particleMouseOut").bind("particleMouseOut",_particleMouseOutEventHandler)
				vp.events.unbind("particleClicked").bind("particleClicked",_particleClickedEventHandler)
				_context.attr("width",vp.jQ(window).width())
				_context.attr("height",vp.jQ(window).height())
				_context.start()
				return _disp
			}
		}
		
		t.cleanup = function(){
			_context.pause()
			vp.events.unbind("windowResize")
			vp.events.unbind("particleMouseOver")
			vp.events.unbind("particleMouseOut")
			vp.events.unbind("particleClicked")
		}
		
		function _initialize(){
			vp.util.log("VoxPop Topics Starting",'info')
			_data = {}
			_setup_events()
			_disp = null
			_context = null
			_construct_display()
			_load_topics()
			return t
		}
		
		function _setup_events(){
			
		}
		
		function _construct_display(cb){
			_disp = vp.jQ("<div class='universe'></div>")
			_disp.append('<div id="displayTitle">'+
					'<h1>'+vp.config.universe.title+'</h1><br/>'+
					'<h3>'+vp.config.universe.subtitle+'</h3>'+
			'</div>')
			_context = vp.jQ("<canvas></canvas>").particleContext({})
			_context.attr("width",vp.jQ(window).width()-20)
			_context.attr("height",vp.jQ(window).height()-30)
			_context.css("margin",'auto')
			_attractor = _context.add_global_force({x: vp.jQ(document).width()/2, y:vp.jQ(document).height()/2}, 0.65, 800)
			_disp.append(_context)
		}
		
		function _load_topics(){
			function callback(d, ts){
				vp.console.hideConsole()
				_data['/universe/top'] = d
				_generate_particles(_data['/universe/top'])
			}
			function errorCallback(xhr, ts, ec){
				vp.console.hideConsole()
			}
			
			if(_data['/universe/top']){
				_generate_particles(_data['/universe/top'])
			} else {
				vp.console.printToConsole("Loading Top Facets")
				vp.console.showAnimatedLoader()
				vp.resources.getResource("/universe/top", {}, callback, errorCallback)
			}
		}
		
		function _windowResizeEventHandler(e){
			vp.util.dump('universe._windowResizeEventHandler')
			if(_context != null){
				_context.attr("width",vp.jQ(window).width())
				_context.attr("height",vp.jQ(window).height())
				_context.updateBounds()
				_attractor.pos.setElements([vp.jQ(document).width()/2,vp.jQ(document).height()/2+50])
				
			}
		}
		
		function _generate_particles(d){
			if(d.length){
				var _min = d[d.length-1].key - 1
				var _max = d[0].key
				for(var i in d){
					var __ratio = d[i].value.n_positive / (d[i].value.n_positive+d[i].value.n_negative)
					var __pos = {x: vp.util.rand(((vp.jQ(window).width()/2)-300),((vp.jQ(window).width()/2)+300)), y:vp.util.rand(((vp.jQ(window).height()/2)-300),((vp.jQ(window).height()/2)+300))}
					var __color = vp.util.fadeColorsForRatio(__ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive)
					var __radius = _o.min_radius + (((d[i].key - _min)/(_max - _min)) * (_o.max_radius - _o.min_radius))
					var __fontSize = 8 + (((d[i].key - _min)/(_max - _min)) * (13 - 8))
					var __myParticle = new vp.fn.particle({pos:__pos, radius:__radius, data:d[i], text: d[i].value.name, color:__color,fontSize:__fontSize})
					_context.add_particle(__myParticle)
				}
			}
		}
		
		function _particleMouseOverEventHandler(e,d){
			
		}
		
		function _particleMouseOutEventHandler(e,d){
			
		}
		
		function _particleClickedEventHandler(e,d){
			vp.events.trigger('filterKeyAdded',{key:d.data.value.key})
		}
		
		t.update = function(){
			_context.updateSize()
			_context.start()
		}
		
		t.pause = function(){
			_context.pause()
		}
		
		return _initialize()
	}
})(vp);