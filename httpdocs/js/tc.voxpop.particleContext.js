/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config['particleContext'] = {}
	vp.config.particleContext['particleLabel'] = vp.jQ("<p class='particleLabel'>aaa</p>")
	
	vp.jQ.fn.particleContext = function(options){
		var o, $pc, particles, labels, context, frame, forces, internal_bounds_plane, _stopped, _paused, _mouse_pos, _mouse_down_pos, _bounds
		
		$pc = this
		o = vp.jQ.extend( {
			framerate:30,
			version:0,
			gravity:0,
			bounds:	{
						min_x: 0,
						max_x: vp.jQ(window).width(),
						min_y: 0,
						max_y: vp.jQ(window).height()
					},
			labels:true
		},options);
		
		function initialize(){
			vp.util.log("Initializing Particle Context")
			forces = []
			particles = []
			labels = []
			frame = 0
			_stopped = true
			_paused = false
			_mouse_pos = null
			_mouse_down_pos = null
			_bounds = o.bounds
			setup_events()
			//internal_bounds = internalizeBounds(o.bounds)
			context = $pc.get(0).getContext('2d')
		}
		
		function setup_events(){
			$pc.bind('mousemove',_mouseMoveEventHandler)
			$pc.bind('mousedown',_mouseClickEventHandler)
			$pc.bind('mouseout',_mouseOutEventHandler)
		}
		
		function _mouseMoveEventHandler(e){
			_mouse_pos = Vector.create([e.layerX, e.layerY])
		}
		
		function _mouseClickEventHandler(e){
			_mouse_down_pos = Vector.create([e.layerX, e.layerY])
		}
		
		function _mouseOutEventHandler(){
			//_mouse_pos = null
		}
		
		function internalizeBounds(bounds_obj){
			var _x = 0
			var _y = $pc.offset().top * -1.0
			//bounds = Plane.create(Vector.create([_x,_y,_z]), )
			return bounds_obj
		}
		
		$pc.updateBounds = function(){
			//internal_bounds_plane = internalizeBounds(bounds)
			_bounds = { min_x: 0, max_x: vp.jQ(window).width(), min_y: 0, max_y: vp.jQ(window).height() }
		}
		
		$pc.add_particle = function(particle){
			particles.push(particle)
			if(o.labels){
				var __label = vp.config.particleContext.particleLabel.clone()
				__label.css('width',(particle.radius()*1.8)+"px")
				var __text = particle.name()
				if(__text.length > 35){
					__text = __text.substring(0,35)+"..."
				}
				if(particle.fontSize){
					__label.css('font-size',particle.fontSize+'px')
					__label.css('line-height',(particle.fontSize+(particle.fontSize/3))+'px')
				}
				__label.text(__text)
				__label.attr('rel',vp.json.stringify(particle.data))
				__label.bind('click',_labelClickHandler)
				labels.push(__label.appendTo($pc.parent()))
			}
		}
		
		function _labelClickHandler(e){
			vp.events.trigger("particleClicked",{data:vp.json.parse(vp.jQ(e.target).attr('rel'))})
		}
		
		$pc.add_global_force = function(pos, strength, radius){
			if(pos.x && pos.y){
				var force = {pos:Vector.create([pos.x,pos.y]), strength:strength, radius:radius}
				forces.push(force)
				return forces[forces.length-1]
			}
		}
		
		$pc.updateSize = function(){
			//rvp.jQ.timer(400,_updateSize)
			vp.jQ('body').css('overflowY','hidden')
			$pc.attr("width",vp.jQ(window).width())
			$pc.attr("height",vp.jQ(window).height())
		}
		
		function _updateSize(){
			$pc.attr("width",vp.jQ(window).width())
			$pc.attr("height",vp.jQ(window).height())
		}
		
		$pc.update = function(){
			frame++
			var __isHover = false
			if(!_stopped){
				for(var i = 0; i < particles.length; i++){
					if(particles[i].initialized() && particles[i].isVisible({})){
						
						if(_paused){
							particles[i]['stop']()
						} else {
							particles[i]['reset_forces']()
							particles[i]['add_forces'](forces)
							particles[i]['bounce_off_walls'](_bounds)
							particles[i]['collide_with_particles'](particles,i)
							particles[i]['add_damping']()
						}
						if(_mouse_pos != null){
							if(particles[i]['contains_vector'](_mouse_pos)){
								particles[i]['hover']()
								__isHover = true
							} else {
								particles[i]['no_hover']()
							}
						} else {
							particles[i]['no_hover']()
						}
						if(_mouse_down_pos != null){
							if(particles[i]['contains_vector'](_mouse_down_pos)){
								particles[i]['click']()
							}
						}
						particles[i]['update']()
						if(o.labels){
							labels[i].css('left',particles[i].pos().elements[0]-(particles[i].radius()-particles[i].radius()*0.05))
							labels[i].css('top',particles[i].pos().elements[1]-(particles[i].radius()/4) + 5)
						}
					}
				}
			}
			_mouse_down_pos = null
			_draw()
			if(__isHover){
				$pc.addClass('hover')
			} else {
				$pc.removeClass('hover')
			}
			if(!_stopped){
				vp.jQ.timer(1000/o.framerate,$pc.update)
			}
		}
		
		$pc.paused = function(){
			return _paused
		}
		
		$pc.start = function(){
			vp.util.log("Starting Particle Context")
			$pc.unbind('mousemove').bind('mousemove',_mouseMoveEventHandler)
			$pc.unbind('mousedown').bind('mousedown',_mouseClickEventHandler)
			$pc.unbind('mouseout').bind('mouseout',_mouseOutEventHandler)
			_paused = false
			_mouse_pos = null
			_mouse_down_pos = null
			if(_stopped){
				_stopped = false
				vp.jQ.timer(1000/o.framerate,$pc.update)
			}
		}
		
		$pc.pause = function(){
			vp.util.log("Pausing Particle Context")
			_paused = true
		}
		
		$pc.stop = function(){
			vp.util.log("Stopping Particle Context")
			$pc.unbind('mousemove')
			$pc.unbind('mousedown')
			$pc.unbind('mouseout')
			_stopped = true
		}
		
		function _draw(){
			context.clearRect(0,0,$pc.width(),$pc.height())
			for(var i = 0; i < particles.length; i++){
				particles[i].draw(context,frame)
			}
		}
		
		initialize()
		return $pc
	}
})(vp);