/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	if(!vp.config.timeline){
		vp.config['timeline'] = {}
	}
	vp.config.timeline['base'] = vp.jQ('<div id="chart"></div>')
	
	vp.fn.timeline = function(options){
		var vpc, _o, _myDisplay, _timeline = null, _data = {}, _req = null, _displaying = null, _redrawTimer = null, _currentPlotLines = [],  _modalTimer = null, _tooltip = null, _currentTooltipData = null, _mousepos = {}
		
		vpc = this
		_o = vp.jQ.extend({
			min_radius:3,
			max_radius:30
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Timeline Initializing")
			vp.events.bind('sectionOpened',_sectionOpenedHandler)
			vp.events.bind('timelinePointMouseover',_timelinePointMouseoverEventHandler)
			vp.events.bind('timelinePointMouseout',_timelinePointMouseoutEventHandler)
			_mousepos['x'] = 0
			_mousepos['y'] = 0
			vp.jQ(window).bind('resize',_documentResizeHandler)
			_buildDisplay()
			return vpc
		}
		
		function _sectionOpenedHandler(e,d){
			if(d.sectionName){
				if(d.sectionName == 'universe'){
					_clearTimeline()
				}
			}
		}
		
		function _documentResizeHandler(e){
			//vp.util.dump('timeline._documentResizeHandler')
			this._redraw = function(){
				_redrawTimer = null
				if(_timeline && _timeline.series){
					_buildTimeline(_timeline.series)
				} else {
					_buildTimeline()
				}
			}
			if(_redrawTimer == null){
				_redrawTimer = vp.jQ.timer(500,_redraw)
			}
		}
		
		function _timelinePointMouseoverEventHandler(e,d){
			if(d){
				_currentTooltipData = vp.json.parse(d.name)
				if(_modalTimer){
					vp.jQ.clearTimer(_modalTimer)
				}
				_modalTimer = vp.jQ.timer(100,_showTooltip)
			}
		}
		
		function _timelinePointMouseoutEventHandler(e,d){
			_currentTooltipData = null
			if(_modalTimer){
				vp.jQ.clearTimer(_modalTimer)
			}
			_modalTimer = vp.jQ.timer(100,_hideTooltip)
		}
		
		function _showTooltip(){
			if(_modalTimer){
				vp.jQ.clearTimer(_modalTimer)
				_modalTimer = null
			}
			
			if(!_myDisplay.find('.map_tooltip').length){
				_tooltip = vp.config.map.tooltip.clone().css('opacity',0.0).appendTo(_myDisplay)
				_tooltip.animate({'opacity':1.0},200)
			} else {
				_tooltip = _myDisplay.find('.map_tooltip')
				_tooltip.css('opacity',1.0)
			}
			
			_tooltip.css('left',_mousepos.x+7+'px')
			_tooltip.css('top',_mousepos.y+7+'px')
			
			if(_currentTooltipData){
				_tooltip.children().remove()
				var _singular = null
				if(_currentTooltipData.commentIds){
					if(_currentTooltipData.commentIds.length == 1){
						_singular = true
					}
					if(_singular){
						_tooltip.append('<p class="title">'+_currentTooltipData.commentIds.length+' Comment</p>') 
					} else {
						_tooltip.append('<p class="title">'+_currentTooltipData.commentIds.length+' Comments</p>')
					}
					
				}
				if(_currentTooltipData.timestamp){
					var newDate = new Date( );
					newDate.setTime( _currentTooltipData.timestamp*1000 );
					if(_singular){
						_tooltip.append('<p>on '+ newDate.toDateString() +' is </p>')
					} else {
						_tooltip.append('<p>on '+ newDate.toDateString() +' are </p>')
					}
				}
				if(_currentTooltipData.ratio){
					var _color = "#"+vp.util.fadeColorsForRatio(_currentTooltipData.ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive)
					if(_currentTooltipData.ratio < 0.5){
						_tooltip.append('<p style="color:'+_color+';">'+(100 - Math.ceil(_currentTooltipData.ratio*100))+'% negative.</p>')
					} else {
						_tooltip.append('<p style="color:'+_color+';">'+Math.ceil(_currentTooltipData.ratio*100)+'% positive.</p>')
					}
				}
				//_tooltip.append('<p class="meta">'+((_currentTooltipData.n_positive * 1.0)+(_currentTooltipData.n_negative * 1.0))+' affective words.</p>')
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
		
		function _clearTimeline(){
			if(_timeline){
				for(var i in _timeline.series){
					_timeline.series[i].setData([],true)
				}
				for(var i in _currentPlotLines){
					_timeline.xAxis[0].removePlotLine(_currentPlotLines[i])
					delete _currentPlotLines[i]
				}
			}
		}
		
		function _loadDataForKey(key){
			function success(d, ts){
				vp.console.hideConsole()
				_req = null
				_data[key] = d
				_updateSentiMeter(key)
				_addDataToTimeline(_data[key])
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
				_addDataToTimeline(_data[key])
				if(_data[key].related){
					vp.events.trigger('relatedFacetsLoaded',_data[key])
				}
				if(_data[key].n_comments){
					vp.events.trigger('nCommentsLoaded',{nComments:_data[key].n_comments})
				}
			} else {
				vp.console.clearConsole()
				vp.console.printToConsole("Loading Timeline Data")
				vp.console.showAnimatedLoader()
				if(_req){
					_req.abort()
				}
				_req = vp.resources.getResource("/timeline/children/"+key, {}, success, error)
			}
		}
		
		function _buildDisplay(){
			_myDisplay = vp.config.timeline.base.clone()
		}
		
		function _buildTimeline(){
			//vp.util.dump('timeline._buildTimeline')
			if(_timeline){
				_clearTimeline()
				_myDisplay.find('.highcharts-image-map').unbind('mousemove',_mousemoveHandler)
				_timeline.destroy()
				_timeline = null
			}
			var _options = vp.config.timeline.highcharts
			
			if(document.getElementById(_options.chart.renderTo)){
				_timeline = new Highcharts.Chart(_options)
			}
			
			_myDisplay.find('.highcharts-image-map').bind('mousemove',_mousemoveHandler)
			
			if(_displaying){
				if(_data[_displaying]){
					_addDataToTimeline(_data[_displaying])
				}
			}
		}
		
		vpc.getDisplay = function(){
			return _myDisplay
		}
		
		vpc.update = function(data){
			vp.util.dump('timeline.update')
			if(!_timeline){
				_buildTimeline()
			}
			if(data){
				if(data.id){
					if(data.id != _displaying){
						_displaying = data.id
						_loadDataForKey(data.id)
					}
				}
			}
		}
		
		vpc.pause = function(){
			vp.util.dump('timeline.pause')
			if(_req){
				_req.abort()
			}
		}
		
		function _updateSentiMeter(key){
			vp.util.dump('timeline._updateSentiMeter')
			if(_data[key].aggregateSentiment){
				vp.events.trigger('updateSentiMeter',_data[key].aggregateSentiment)
			}
		}
		
		function _addDataToTimeline(data){
			_clearTimeline()
			var _min = 999, _max = 0, _earliest = null, _latest = null, _clusters = [], _smoothed = [], _points = [], _bins = [], _articles = []
			
			if(data.clusters){
				for(var i in data.clusters){
					var _nPos = 0
					var _nNeg = 0
					for(var j in data.clusters[i]){
						_nPos += data.clusters[i][j]['n_positive']
						_nNeg += data.clusters[i][j]['n_negative']
					}
					var _volume = _nPos + _nNeg
					if(_volume > _max){
						_max = _volume
					}
					if(_volume < _min){
						_min = _volume
					}
				}
			
				for(var i in data.clusters){
					var _myPoint = {}
				
					var _nPos = 0, _nNeg = 0, _avgTimestamp = 0, _avgRatio = 0
					for(var j in data.clusters[i]){
						_nPos += data.clusters[i][j]['n_positive']
						_nNeg += data.clusters[i][j]['n_negative']
						_avgTimestamp += data.clusters[i][0].timestamp
						_avgRatio += data.clusters[i][0].ratio
					}
					_avgTimestamp = _avgTimestamp/data.clusters[i].length
					_myPoint['x'] = _avgTimestamp * 1000
					if(!_latest){ _latest = _myPoint['x']; }
					if(!_earliest){ _earliest = _myPoint['x']; }
					if(_myPoint['x'] > _latest){ _latest = _myPoint['x']; }
					if(_myPoint['x'] < _earliest){ _earliest = _myPoint['x']; }
				
					_avgRatio = _avgRatio/data.clusters[i].length
					_myPoint['y'] = _avgRatio
				
					var _volume = _nPos + _nNeg
					if(_volume > _max){ _max = _volume; }
					if(_volume < _min){ _min = _volume; }
					
					var _radius = _o.min_radius + (((_volume - _min)/(_max - _min)) * (_o.max_radius - _o.min_radius))
					var _ratio = _nPos / (_nNeg+_nPos)
					_myPoint['marker'] = {}
					var _myHex = "#"+vp.util.fadeColorsForRatio(_ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive)
					_myPoint.marker['fillColor'] = 'rgba('+vp.util.getRGBFromHex('r',_myHex)+','+vp.util.getRGBFromHex('g',_myHex)+','+vp.util.getRGBFromHex('b',_myHex)+',0.5)'
					_myPoint.marker['radius'] = _radius
					_clusters.push(_myPoint)
				}
			}
			
			if(data.points){
				for(var i in data.points){
					var _volume = data.points[i]['n_positive'] + data.points[i]['n_negative']
					if(_volume > _max){
						_max = _volume
					}
					if(_volume < _min){
						_min = _volume
					}
				}
				
				for(var i in data.points){
					var _myPoint = {}
					var _nPos = data.points[i]['n_positive'], _nNeg = data.points[i]['n_negative'], _timestamp = data.points[i].timestamp, _ratio = data.points[i].ratio
					_myPoint['x'] = _timestamp * 1000
					if(!_latest){ _latest = _myPoint['x']; }
					if(!_earliest){ _earliest = _myPoint['x']; }
					if(_myPoint['x'] > _latest){ _latest = _myPoint['x']; }
					if(_myPoint['x'] < _earliest){ _earliest = _myPoint['x']; }
					_myPoint['y'] = _ratio
				
					var _volume = _nPos + _nNeg
					if(_volume > _max){ _max = _volume; }
					if(_volume < _min){ _min = _volume; }
					
					var _radius = _o.min_radius + (((_volume - _min)/(_max - _min)) * (_o.max_radius - _o.min_radius))
					var _ratio = _nPos / (_nNeg+_nPos)
					_myPoint['marker'] = {}
					var _myHex = "#"+vp.util.fadeColorsForRatio(_ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive)
					_myPoint.marker['fillColor'] = 'rgba('+vp.util.getRGBFromHex('r',_myHex)+','+vp.util.getRGBFromHex('g',_myHex)+','+vp.util.getRGBFromHex('b',_myHex)+',0.5)'
					_myPoint.marker['radius'] = _radius
					_points.push(_myPoint)
				}
			}
			
			if(data.bins){
				for(var i in data.bins){
					for(var j in data.bins[i]){
						var _volume = 0
						for(var k in data.bins[i][j]){
							_volume += data.bins[i][j][k]['n_positive'] + data.bins[i][j][k]['n_negative']
							if(_volume > _max){
								_max = _volume
							}
							if(_volume < _min){
								_min = _volume
							}
						}
					}
				}
				
				for(var i in data.bins){
					for(var j in data.bins[i]){
						var _myPoint = {}, _nPos = 0, _nNeg = 0, _timestamp = i*1.0, _ratio = j*1.0, _keys = []
						for(var k in data.bins[i][j]){
							_nPos += data.bins[i][j][k]['n_positive']
							_nNeg += data.bins[i][j][k]['n_negative']
							_keys.push(data.bins[i][j][k]['key'])
						}
						
						_myPoint['x'] = _timestamp * 1000
						if(!_latest){ _latest = _myPoint['x']; }
						if(!_earliest){ _earliest = _myPoint['x']; }
						if(_timestamp * 1000 > _latest){ _latest = _timestamp * 1000; }
						if(_timestamp * 1000 < _earliest){ _earliest = _timestamp * 1000; }
						_myPoint['y'] = _ratio
				
						var _volume = _nPos + _nNeg
						if(_volume > _max){ _max = _volume; }
						if(_volume < _min){ _min = _volume; }
						
						var _radius = _o.min_radius + (((_volume - _min)/(_max - _min)) * (_o.max_radius - _o.min_radius))
						var _ratio = _nPos / (_nNeg+_nPos)
						var _data = {id:(hex_md5(_displaying.join(','))+'_'+i+'_'+j).replace('.',''),key:_displaying,commentIds:_keys,timestamp:_timestamp, ratio:_ratio}
						_myPoint['name'] = vp.json.stringify(_data)
						
						_myPoint['marker'] = {}
						var _myHex = "#"+vp.util.fadeColorsForRatio(_ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive)
						_myPoint.marker['fillColor'] = 'rgba('+vp.util.getRGBFromHex('r',_myHex)+','+vp.util.getRGBFromHex('g',_myHex)+','+vp.util.getRGBFromHex('b',_myHex)+',0.5)'
						_myPoint.marker['radius'] = _radius
						_bins.push(_myPoint)
					}
				}
			}
			
			for(var i in data.articles){
				var _myBar = {}
				_myBar['x'] = data.articles[i].timestamp*1000
				if(data.articles[i].timestamp*1000 < _earliest){ _earliest = data.articles[i].timestamp*1000; }
				if(data.articles[i].timestamp*1000 > _latest){ _latest = data.articles[i].timestamp*1000; }
				
				_myBar['y'] = 1.0
				_myBar['name'] = vp.json.stringify({title:data.articles[i].title,articleId:data.articles[i].key})
				_articles.push(_myBar)
			}
			
			for(var i in data.smoothed){
				var _myPoint = {}
				_myPoint['x'] = i * 1000
				_myPoint['y'] = data.smoothed[i]
				_smoothed.push(_myPoint)
			}
			
			if(_clusters.length){
				_timeline.series[1].setData(_clusters,false)
			}
			if(_points.length){
				_timeline.series[1].setData(_points,false)
			}
			if(_bins.length){
				_timeline.series[1].setData(_bins,false)
			}
			if(_articles.length){
				_timeline.series[2].setData(_articles,false)
			}
			if(_smoothed.length){
				_timeline.series[0].setData(_smoothed,false)
			}
			if(_timeline.xAxis[0] && _earliest && _latest){
				var _padding = (_latest-_earliest)*0.025
				_timeline.xAxis[0].setExtremes(_earliest-_padding,_latest+_padding)
			}
		}
		
		return _initialize()
	}
})(vp);