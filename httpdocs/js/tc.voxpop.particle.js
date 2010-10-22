/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.fn.particle = function(options){
		var o, p, name, pos, vel, frc, radius, target_radius, jitter, fill, initialized, damping, _hovered, last_pos, bubbling
		
		initialized = false
		
		p = this
		
		o = vp.jQ.extend( {
			pos:{x:0,y:0},
			vel:{x:0,y:0},
			frc:{x:0,y:0},
			damping:0.90,
			radius:5,
			jitter:{x:0,y:0},
			oscillate:false,
			osc_rate: 0,
			color:"ffffff",
			opacity:0.85,
			attraction_coefficient: 1.0,
			text:'',
			fontSize:10,
			data:{}
		},options);
		
		function initialize(){
			pos = Vector.create([o.pos.x, o.pos.y])
			last_pos = Vector.create([o.pos.x, o.pos.y])
			vel = Vector.create([o.vel.x, o.vel.y])
			frc = Vector.create([o.frc.x, o.frc.y])
			damping = o.damping
			jitter = o.jitter
			radius = o.radius
			name = o.text
			_hovered = false
			if(o.opacity < 1.0){
				fill = "rgba("+vp.util.getRGBFromHex('r',o.color)+","+vp.util.getRGBFromHex('g',o.color)+","+vp.util.getRGBFromHex('b',o.color)+","+o.opacity+")"
			} else {
				fill = "#"+o.color
			}
			initialized = true
		}
		
		p.data = o.data
		p.fontSize = o.fontSize
		
		p.initialized = function(){
			return initialized
		}
		
		p.name = function(new_name){
			if(new_name){
				name = new_name
			} else {
				return name
			}
		}
		
		p.pos = function(new_pos){
			if(new_pos){
				pos = new_pos
			} else {
				return pos
			}
		}
		
		p.vel = function(new_vel){
			if(new_vel){
				vel = new_vel
			} else {
				return vel
			}
		}
		
		p.frc = function(new_frc){
			if(new_frc){
				frc = new_frc
			} else {
				return frc
			}
		}
		
		p.radius = function(new_radius){
			if(new_radius){
				radius = new_radius
			} else {
				return radius
			}
		}
		
		p.reset_forces = function(){
			frc.setElements([0, 0])
			_highlight = false
		}
		
		p.add_forces = function(forces){
			for(var i = 0; i < forces.length; i++){
				var distance = pos.subtract(forces[i].pos)
				var length = Math.sqrt(distance.dot(distance))
				if(length < forces[i].radius){
					var pct = 1 - (length / forces[i].radius)
					var normal_distance = distance.multiply(1/length)
					frc.elements[0] = frc.elements[0] - normal_distance.elements[0] * forces[i].strength * pct * o.attraction_coefficient
					frc.elements[1] = frc.elements[1] - normal_distance.elements[1] * forces[i].strength * pct * o.attraction_coefficient
				}
			}
		}
		
		p.collide_with_particles = function(particles,j){
			for(var i = 0; i < particles.length; i++){
				if(i != j){
					var distance = pos.subtract(particles[i].pos())
					var length = Math.sqrt(distance.dot(distance))
					if(length < (radius + particles[i].radius())+2){
						var pct = 1 - (length / (radius + particles[i].radius() + 2))
						var normal_distance = distance.multiply((1/(length/4)))
						frc.elements[0] = frc.elements[0] - normal_distance.elements[0] * -0.7// * pct
						frc.elements[1] = frc.elements[1] - normal_distance.elements[1] * -0.7// * pct
					}
				}
			}
		}
		
		p.stop = function(){
			frc.setElements([0, 0])
			vel.setElements([0, 0])
		}
		
		p.add_damping = function(){
			vel = vel.multiply(damping)
		}
		
		p.contains_vector = function(_mp){
			var distance = pos.subtract(_mp)
			var length = Math.sqrt(distance.dot(distance))
			if(length < radius){
				return true
			} else {
				return false
			}
		}
		
		p.no_hover = function(){
			if(_hovered){
				vp.events.trigger("particleMouseOut",{name:o.text})
				_hovered = false
			}
		}
		
		p.hover = function(){
			if(!_hovered){
				vp.events.trigger("particleMouseOver",{name:o.text,pos:pos})
				_hovered = true
			}
			vel = vel.multiply(0)
		}
		
		p.click = function(){
			vp.events.trigger("particleClicked",{data:o.data})
		}
		
		p.bounce_off_walls = function(bounds){
			var b_did_i_collide = false
			if(pos.elements[0] < bounds.min_x + radius){
				pos.elements[0] = radius
				b_did_i_collide = true
				vel.elements[0] = vel.elements[0] * -1.0
			}else if(pos.elements[0] > bounds.max_x - radius){
				pos.elements[0] = bounds.max_x - radius
				b_did_i_collide = true
				vel.elements[0] = vel.elements[0] * -1.0
			}
			if(pos.elements[1] < bounds.min_y + radius){
				pos.elements[1] = radius
				b_did_i_collide = true
				vel.elements[1] = vel.elements[1] * -1.0
			}else if(pos.elements[1] > bounds.max_y - radius){
				pos.elements[1] = bounds.max_y - radius
				b_did_i_collide = true
				vel.elements[1] = vel.elements[1] * -1.0
			}
			
			if(b_did_i_collide){
				vel = vel.multiply(0.3)
			}
		}
		
		p.bubble_up = function(){
			target_radius = radius
			radius = 0
			bubbling = true
			return p
		}
		
		p.update = function(forces){
			if(_hovered){
				vel = vel.add(frc.multiply(0.6))
			} else {
				vel = vel.add(frc)
			}
			if(bubbling){
				if(radius < target_radius){
					radius = radius + 10
				} else {
					bubbling = false
				}
			} else {
				pos = pos.add(vel).multiply(0.5).add(last_pos.multiply(0.5))
				last_pos = pos
			}
			if(o.oscillate){
				pos = pos.add( Vector.create([Math.random(-1*jitter.x,jitter.x), Math.random(-1*jitter.y,jitter.y)] ))
			}
		}
		
		p.draw = function(context,frame){
			if(_hovered){
				context.fillStyle = "#ffffff"
			} else {
				context.fillStyle = fill
			}
			context.beginPath()
			if(o.oscillate){
				context.arc(pos.elements[0] + (Math.sin(frame*o.osc_rate)*jitter.x), pos.elements[1] + (Math.sin(frame*o.osc_rate)*jitter.y), radius, 0, (2*Math.PI), false)
			} else {
				context.arc(pos.elements[0], pos.elements[1], radius, 0, (2*Math.PI), false)
			}
			context.fill()
			context.closePath()
		}
		
		p.isVisible = function(bounds){
			//if(p.pos.x < bounds.min_x || p.pos.x > bounds.max_x || p.pos.y < bounds.min_y || p.pos.y > bounds.max_y){
				
			//}
			return true
		}
		
		initialize()
	}
})(vp);
