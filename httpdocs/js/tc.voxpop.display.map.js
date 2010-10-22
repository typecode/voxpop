/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config['map'] = {}
	vp.config.map['base'] = vp.jQ('<div id="cm-example" style="width: 99%; height: 100%;"></div>')
	vp.config.map['tooltip'] = vp.jQ('<div class="map_tooltip"></div>')
	
	vp.config.map['preloader'] = []
	vp.config.map.preloader[0] = new Image(64,64);
	vp.config.map.preloader[0].src = "/gs/map_icon_0.png";
	vp.config.map.preloader[1] = new Image(64,64);
	vp.config.map.preloader[1].src = "/gs/map_icon_1.png";
	vp.config.map.preloader[2] = new Image(64,64);
	vp.config.map.preloader[2].src = "/gs/map_icon_2.png";
	vp.config.map.preloader[3] = new Image(64,64);
	vp.config.map.preloader[3].src = "/gs/map_icon_3.png";
	vp.config.map.preloader[4] = new Image(64,64);
	vp.config.map.preloader[4].src = "/gs/map_icon_4.png";
	vp.config.map.preloader[5] = new Image(64,64);
	vp.config.map.preloader[5].src = "/gs/map_icon_5.png";
	vp.config.map.preloader[6] = new Image(64,64);
	vp.config.map.preloader[6].src = "/gs/map_icon_6.png";
	vp.config.map.preloader[7] = new Image(64,64);
	vp.config.map.preloader[7].src = "/gs/map_icon_7.png";
	vp.config.map.preloader[8] = new Image(64,64);
	vp.config.map.preloader[8].src = "/gs/map_icon_8.png";
	vp.config.map.preloader[9] = new Image(64,64);
	vp.config.map.preloader[9].src = "/gs/map_icon_9.png";
	vp.config.map.preloader[10] = new Image(64,64);
	vp.config.map.preloader[10].src = "/gs/map_icon_10.png";
	vp.config.map.preloader[11] = new Image(64,64);
	vp.config.map.preloader[11].src = "/gs/map_icon_11.png";
	vp.config.map.preloader[12] = new Image(64,64);
	vp.config.map.preloader[12].src = "/gs/map_icon_12.png";
	vp.config.map.preloader[13] = new Image(64,64);
	vp.config.map.preloader[13].src = "/gs/map_icon_13.png";
	vp.config.map.preloader[14] = new Image(64,64);
	vp.config.map.preloader[14].src = "/gs/map_icon_14.png";
	vp.config.map.preloader[15] = new Image(64,64);
	vp.config.map.preloader[15].src = "/gs/map_icon_15.png";
	vp.config.map.preloader[16] = new Image(64,64);
	vp.config.map.preloader[16].src = "/gs/map_icon_16.png";
	vp.config.map.preloader[17] = new Image(64,64);
	vp.config.map.preloader[17].src = "/gs/map_icon_17.png";
	vp.config.map.preloader[18] = new Image(64,64);
	vp.config.map.preloader[18].src = "/gs/map_icon_18.png";
	
	vp.config.map['icons'] = []
	vp.config.map.icons[0]  = "/gs/map_icon_0.png";
	vp.config.map.icons[1]  = "/gs/map_icon_1.png";
	vp.config.map.icons[2]  = "/gs/map_icon_2.png";
	vp.config.map.icons[3]  = "/gs/map_icon_3.png";
	vp.config.map.icons[4]  = "/gs/map_icon_4.png";
	vp.config.map.icons[5]  = "/gs/map_icon_5.png";
	vp.config.map.icons[6]  = "/gs/map_icon_6.png";
	vp.config.map.icons[7]  = "/gs/map_icon_7.png";
	vp.config.map.icons[8]  = "/gs/map_icon_8.png";
	vp.config.map.icons[9]  = "/gs/map_icon_9.png";
	vp.config.map.icons[10] = "/gs/map_icon_10.png";
	vp.config.map.icons[11] = "/gs/map_icon_11.png";
	vp.config.map.icons[12] = "/gs/map_icon_12.png";
	vp.config.map.icons[13] = "/gs/map_icon_13.png";
	vp.config.map.icons[14] = "/gs/map_icon_14.png";
	vp.config.map.icons[15] = "/gs/map_icon_15.png";
	vp.config.map.icons[16] = "/gs/map_icon_16.png";
	vp.config.map.icons[17] = "/gs/map_icon_17.png";
	vp.config.map.icons[18] = "/gs/map_icon_18.png";
	
	vp['cloudmade'] = new CM.Tiles.CloudMade.Web({key: 'BC9A493B41014CAABB98F0471D759707',styleId:14110})
		
	vp.fn.map = function(options){
		var vpm, _o, _myDisplay, _map, _data, _req, _displayed = null, _markers = [], _clusterer = null, _modalTimer = null, _tooltip = null, _currentTooltipData = null, _mousepos = {}
		
		vpm = this
		_o = vp.jQ.extend({
			controls:true,
			min_radius:4,
			max_radius:64,
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Map Initializing")
			_map = null
			_req = null
			_mousepos['x'] = 0
			_mousepos['y'] = 0
			_data = {}
			vp.events.bind('sectionOpened',_sectionOpenedHandler)
			vp.events.bind('readmodalOpening',_readmodalOpeningEventHandler)
			vp.events.bind('readmodalClosing',_readmodalClosingEventHandler)
			_buildDisplay()
			return vpm
		}
		
		function _sectionOpenedHandler(e,d){
			if(d.sectionName){
				if(d.sectionName == 'universe'){
					_clearMap()
				}
			}
		}
		
		function _readmodalOpeningEventHandler(){
			vp.util.dump('vpm._readmodalOpeningEventHandler')
			_paused = true
		}
		
		function _readmodalClosingEventHandler(){
			vp.util.dump('vpm._readmodalClosingEventHandler')
			_paused = false
		}
		
		function _loadDataForKey(key){
			function success(d, ts){
				vp.console.hideConsole()
				_req = null
				if(d['code']){
					if(d['code'] == '404'){
						return false
						vp.console.printToConsole("Error Loading Content")
						vp.console.hideConsole(100)
					}
				}
				_data[key] = d
				_updateSentiMeter(key)
				_displayPoints(key)
				if(_data[key].related){
					vp.events.trigger('relatedFacetsLoaded',_data[key])
				}
				if(_data[key].n_comments){
					vp.events.trigger('nCommentsLoaded',{nComments:_data[key].n_comments})
				}
			}
			function error(xhr, ts, ec){
				vp.console.hideConsole()
				_req = null
			}
			if(_data[key]){
				_updateSentiMeter(key)
				_displayPoints(key)
				if(_data[key].related){
					vp.events.trigger('relatedFacetsLoaded',_data[key])
				}
				if(_data[key].n_comments){
					vp.events.trigger('nCommentsLoaded',{nComments:_data[key].n_comments})
				}
			} else {
				vp.console.clearConsole()
				vp.console.printToConsole("Loading Comment Locations")
				vp.console.showAnimatedLoader()
				if(_req){
					_req.abort()
				}
				_req = vp.resources.getResource("/map/children/"+key, {}, success, error)
			}
		}
		
		function _clearMap(){
			_displayed = null
			for(var j in _markers){
				vp.jQ(_markers[j]._image).unbind('mouseover',_markerMouseoverHandler)
				vp.jQ(_markers[j]._image).unbind('mouseout',_markerMouseoutHandler)
				vp.jQ(_markers[j]._image).unbind('click',_markerClickHandler)
				_map.removeOverlay(_markers[j])
				delete _markers[j]
			}
		}
		
		function _updateSentiMeter(key){
			if(_data[key].aggregateSentiment){
				vp.events.trigger('updateSentiMeter',_data[key].aggregateSentiment)
			}
		}
		
		function _displayPoints(key){
			_clearMap()
			_map.setCenter(new CM.LatLng(38.71859, -95.800781), 4);
			_displayed = key
			var _min = 999
			var _max = 0
			for(var i in _data[key].comments){
				if(((_data[key].comments[i].n_negative * 1.0) + (_data[key].comments[i].n_positive * 1.0)) > _max){
					_max = ((_data[key].comments[i].n_negative * 1.0) + (_data[key].comments[i].n_positive * 1.0))
				}
				if(((_data[key].comments[i].n_negative * 1.0) + (_data[key].comments[i].n_positive * 1.0)) < _min){
					_min = ((_data[key].comments[i].n_negative * 1.0) + (_data[key].comments[i].n_positive * 1.0))
				}
			}
			_max = _max + 0.1
			_min = _min - 0.1
			for(var i in _data[key].comments){
				var _radius = _o.min_radius + ((((_data[key].comments[i].n_negative + _data[key].comments[i].n_positive) - _min)/(_max - _min)) * (_o.max_radius - _o.min_radius))
				var _ratio = _data[key].comments[i].n_positive / (_data[key].comments[i].n_negative + _data[key].comments[i].n_positive)
				var _colorIndex = 0
				if(_ratio == 0.5){
					_colorIndex = 0
				} else if((_ratio-0.5)*19 > 0){
					_colorIndex = Math.floor((_ratio-0.5)*19)
				} else if((_ratio-0.5)*19 < 0){
					_colorIndex = Math.ceil((_ratio-0.5)*19)
				} else {
					_colorIndex = 0
				}
				_colorIndex = _colorIndex + 9
				var _icon = new CM.Icon();
				_icon.image = vp.config.map.icons[_colorIndex]
				_icon.iconSize = new CM.Size(_radius,_radius);
				_icon.iconAnchor = new CM.Point(_radius/2,_radius/2);
				_icon.shadowSize = new CM.Size(0,0);
				var _payload = {}
				_payload['meta'] = {}
					_payload.meta['min'] = _min
					_payload.meta['max'] = _max
				_payload['name'] = i
				var _myKey = key.join(',') + ',' + _data[key].comments[i].geo.key
				_payload['key'] = _myKey
				_payload['ratio'] = _ratio
				_payload['n_positive'] = _data[key].comments[i].n_positive
				_payload['n_negative'] = _data[key].comments[i].n_negative
				
				if(_data[key].comments[i].geo.latlng){
					var __latlng = new CM.LatLng(_data[key].comments[i].geo.latlng.lat, _data[key].comments[i].geo.latlng.lng);
					var __marker = new CM.Marker(__latlng,{icon:_icon,clickable:true,data:_payload});
					_map.addOverlay(__marker)
					vp.jQ(__marker._image).attr('rel',vp.json.stringify(_payload))
					vp.jQ(__marker._image).bind('mouseover',_markerMouseoverHandler)
					vp.jQ(__marker._image).bind('mouseout',_markerMouseoutHandler)
					vp.jQ(__marker._image).bind('click',_markerClickHandler)
					_markers.push(__marker)
				}
			}
		}
		
		function _markerMouseoverHandler(e){
			e.target.style.width = ((e.target.style.width.substring(0,e.target.style.width.length-2)*1.0) + 5) + 'px'
			e.target.style.height = ((e.target.style.height.substring(0,e.target.style.height.length-2)*1.0) + 5) + 'px'
			e.target.style.top = ((e.target.style.top.substring(0,e.target.style.top.length-2)*1.0) - 2.5) + 'px'
			e.target.style.left = ((e.target.style.left.substring(0,e.target.style.left.length-2)*1.0) - 2.5) + 'px'
			_currentTooltipData = vp.json.parse(vp.jQ(e.target).attr('rel'))
			_modalTimer = vp.jQ.timer(100,_showTooltip)
		}
		
		function _markerMouseoutHandler(e){
			e.target.style.width = ((e.target.style.width.substring(0,e.target.style.width.length-2)*1.0) - 5) + 'px'
			e.target.style.height = ((e.target.style.height.substring(0,e.target.style.height.length-2)*1.0) - 5) + 'px'
			e.target.style.top = ((e.target.style.top.substring(0,e.target.style.top.length-2)*1.0) + 2.5) + 'px'
			e.target.style.left = ((e.target.style.left.substring(0,e.target.style.left.length-2)*1.0) + 2.5) + 'px'
			_currentTooltipData = null
			_hideTooltip()
			if(_modalTimer){
				vp.jQ.clearTimer(_modalTimer)
				_modalTimer = null
			}
		}
		
		function _markerClickHandler(e){
			var _myData = vp.json.parse(vp.jQ(e.target).attr('rel'))
			vp.events.trigger('openReadmodalWithKey',_myData)
		}
		
		function _showTooltip(){
			if(_modalTimer){
				vp.jQ.clearTimer(_modalTimer)
				_modalTimer = null
			}
			
			if(!_myDisplay.find('.map_toolip').length){
				_tooltip = vp.config.map.tooltip.clone().css('opacity',0.0).appendTo(_myDisplay)
				_tooltip.animate({'opacity':1.0},200)
			} else {
				_tooltip = _myDisplay.find('.map_toolip')
				_tooltip.css('opacity',1.0)
			}
			
			_tooltip.css('left',_mousepos.x+7+'px')
			_tooltip.css('top',_mousepos.y+7+'px')
			
			if(_currentTooltipData){
				_tooltip.append('<p class="title">'+_currentTooltipData.name+'</p>')
				_tooltip.append('<p class="meta">'+((_currentTooltipData.n_positive * 1.0)+(_currentTooltipData.n_negative * 1.0))+' affective words.</p>')
				var _color = "#"+vp.util.fadeColorsForRatio(_currentTooltipData.ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive)
				if(_currentTooltipData.ratio < 0.5){
					_tooltip.append('<p style="color:'+_color+';">'+(100 - Math.ceil(_currentTooltipData.ratio*100))+'% negative.</p>')
				} else {
					_tooltip.append('<p style="color:'+_color+';">'+Math.ceil(_currentTooltipData.ratio*100)+'% positive.</p>')
				}
				
			}
		}
		
		function _mousemoveHandler(e){
			_mousepos.x = e.pageX
			_mousepos.y = e.pageY
			
			if(_tooltip){
				_tooltip.css('left',_mousepos.x+7+'px')
				_tooltip.css('top',_mousepos.y+7+'px')
			}
		}
		
		function _hideTooltip(){
			_myDisplay.find('.map_tooltip').animate({'opacity':0.0},200,function(){
				vp.jQ(this).remove()
				_tooltip = null
			})
		}
		
		function _buildDisplay(){
			_myDisplay = vp.config.map.base.clone()
			_map = new CM.Map(_myDisplay.get(0), vp.cloudmade);
			_map.disableScrollWheelZoom()
			_myDisplay.css('position','fixed')
			_myDisplay.find('.wml-container').css('background','#161616')
			_myDisplay.find('.wml-loading-indicator').css('background',"transparent url(/gs/loader_sm_trans.gif) no-repeat scroll 0 0")
			_map.setCenter(new CM.LatLng(38.71859, -95.800781), 4);
			if(_o.controls){
				var topRight = new CM.ControlPosition(CM.TOP_RIGHT, new CM.Size(80, 120));
				_map.addControl(new CM.LargeMapControl(), topRight);
			}
			CM.Event.addListener(_map, 'zoomend', _mapZoomedEventHandler);
			_myDisplay.bind('mousemove',_mousemoveHandler)
			vp.jQ(document).bind('keypress',_keypressHandler)
		}
		
		function _keypressHandler(e){
			if(!_paused){
				if(e.which == 107){ // '+' zoom in
					_map.zoomIn()
				}
				if(e.which == 106){ // '-' zoom out
					_map.zoomOut()
				}
			}
		}
		
		function _mapZoomedEventHandler(e,d){
			if(d < 2){
				_map.setZoom(2)
				return
			}
			if(d > 11){
				_map.setZoom(11)
				return
			}
			d = d - 5
			var _zoomMin = _o.min_radius + d*2
			if(_zoomMin < 2){
				_zoomMin = 2
			}
			var _zoomMax = _o.max_radius + (d*25)
			for(var j in _markers){
				_map.removeOverlay(_markers[j])
				var _nc = _markers[j]._options.data.n_positive + _markers[j]._options.data.n_negative
				var _radius = _zoomMin + (((_nc - _markers[j]._options.data.meta.min)/(_markers[j]._options.data.meta.max - _markers[j]._options.data.meta.min)) * (_zoomMax - _zoomMin))
				if(_radius < 0){
					_radius = _markers[j]._options.icon.iconSize.width
				}
				var _icon = new CM.Icon();
				_icon.image = _markers[j]._options.icon.image
				_icon.iconSize = new CM.Size(_radius,_radius);
				_icon.iconAnchor = new CM.Point(_radius/2,_radius/2);
				_icon.shadowSize = new CM.Size(0,0);
				var __latlng = new CM.LatLng(_markers[j]._position._lat, _markers[j]._position._lng);
				_markers[j] = new CM.Marker(__latlng,{icon:_icon,clickable:true,data:_markers[j]._options.data});
				_map.addOverlay(_markers[j])
				vp.jQ(_markers[j]._image).attr('rel',vp.json.stringify(_markers[j]._options.data))
				vp.jQ(_markers[j]._image).bind('mouseover',_markerMouseoverHandler)
				vp.jQ(_markers[j]._image).bind('mouseout',_markerMouseoutHandler)
				vp.jQ(_markers[j]._image).bind('click',_markerClickHandler)
			}
		}
		
		vpm.getDisplay = function(){
			vp.util.dump('vpm.getDisplay')
			return _myDisplay
		}
		
		vpm.update = function(data){
			vp.util.dump('vpm.update')
			_paused = false
			if(data){
				if(data.id){
					if(!_displayed){
						_loadDataForKey(data.id) 
					} else if( _displayed.join(',') != data.id.join(',')){
						_loadDataForKey(data.id)
					}
				}
			}
		}
		
		vpm.pause = function(){
			vp.util.dump('vpm.pause')
			_paused = true
			if(_req){
				_req.abort()
			}
		}
		
		return _initialize()
	}
})(vp);