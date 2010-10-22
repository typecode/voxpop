/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.jQ.fn.section_nav = function(options){
		var $vpsn, _o, _currentSection = null
		
		$vpsn = this
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Section Nav Starting",'info')
			_setup_events()
			if(!_o.environmentSupport){
				$vpsn.find('.topicsIcon').remove()
			}
			return $vpsn
		}
		
		function _setup_events(){
			$vpsn.find("a").bind("click",_sectionNavHrefClickHandler)
			vp.events.bind('sectionOpened',_sectionOpenedHandler)
			vp.events.bind('filterStackModified',_filterStackModifiedHandler)
			vp.events.bind("filterKeyAdded",_filterKeyAddedEventHandler)
		}
		
		function _sectionNavHrefClickHandler(e,d){
			
		}
		
		function _sectionOpenedHandler(e,d){
			if(d.sectionName){
				$vpsn.find("a").removeClass('active')
				$vpsn.find("a[name="+d.sectionName+"]").addClass('active')
				if(d.sectionName == 'universe' || (_currentSection == null && d.sectionName == 'about')){
					$vpsn.find("a.keyed").each(function(i,j){
						j.href = "#"+j.name
					})
					_close()
				} else if(d.sectionName != 'about'){
					_open()
				}
				_currentSection = d.sectionName
			}
			if(d.filterStack){
				$vpsn.find("a.keyed").each(function(i,j){
					j.href = '#' + j.name + ','
					for(var i in d.filterStack){
						j.href += d.filterStack[i]
						if(i < d.filterStack.length-1){
							j.href += ','
						}
					}
				})
			}
		}
		
		function _filterStackModifiedHandler(e,d){
			if(d.filterStack){
				$vpsn.find("a.keyed").each(function(i,j){
					j.href = '#' + j.name + ','
					for(var i in d.filterStack){
						j.href += d.filterStack[i]
						if(i < d.filterStack.length-1){
							j.href += ','
						}
					}
				})
			}
		}
		
		function _filterKeyAddedEventHandler(e,d){
			if(d.filterStack){
				$vpsn.find("a.keyed").each(function(i,j){
					j.href = '#' + j.name + ','
					for(var i in d.filterStack){
						j.href += d.filterStack[i]
						if(i < d.filterStack.length-1){
							j.href += ','
						}
					}
				})
			}
		}
		
		function _open(){
			$vpsn.find('.sub').stop().animate({'width':'275px'},600)
		}
		
		function _close(){
			$vpsn.find('.sub').stop().animate({'width':'20px'},600)
		}
		
		return _initialize()
	}
})(vp);