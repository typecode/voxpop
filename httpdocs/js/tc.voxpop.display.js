/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.jQ.fn.display = function(options){
		var $vpd, _o, _currentName, _current, _displays
		
		$vpd = this
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Display Panel Starting",'info')
			vp.jQ.easing.def = "easeOutBack"
			_currentName = null
			_current = null
			_displays = {}
			_setup_events()
		}
		
		function _setup_events(){
		
		}
		
		$vpd.show = function(name,content,data){
			if(!_displays[name]){
				_displays[name] = {}
				_displays[name]['content'] = content
				_displays[name]['display'] = _displays[name]['content'].getDisplay()
				if(typeof _displays[name]['display'].appendTo == 'function'){
					_displays[name]['element'] = _displays[name]['display'].appendTo($vpd)
				} else {
					_displays[name]['element'] = vp.jQ(_displays[name]['display'])
					_displays[name]['element'].appendTo($vpd)
				}
				_displays[name]['element'].addClass('displayUnit')
			}
			
			for(var i in _displays){
				if(i == name){
					if(name != _current){
						_displays[i]['element'].stop()//.css("opacity",0.0)
						_displays[i]['element'].css('zIndex',1000).show().animate({'opacity':1.0},400,function(){
							//vp.events.trigger('sectionOpened',{sectionName:name})
						})
					}
					_displays[i]['content'].update(data)
					
				} else {
					if(name == 'readmodal' || name == 'about'){
						if(typeof _displays[i]['content'].pause == 'function'){
							_displays[i]['content'].pause()
						}
						_displays[i].element.css('zIndex',999)
					} else {
						if(typeof _displays[i]['content'].pause == 'function'){
							_displays[i]['content'].pause()
						}
						_displays[i].element.css('zIndex',999).stop().animate({'opacity':0.0},400,function(){
							vp.jQ(this).hide()
						})
					}
				}
			}
			_current = name
		}
		
		_initialize()
		return $vpd
	}
})(vp);