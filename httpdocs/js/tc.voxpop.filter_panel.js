/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config['filter_panel'] = {}
	vp.config.filter_panel['selected_facet'] = vp.jQ('<li class="selectedFacet"><a class="dsBtn" title="Remove this filter" href="#" target="voxpop"></a></li>')
	vp.config.filter_panel['related_facet'] = vp.jQ('<li><a href="#" title="Add this filter" target="voxpop"></a></li>')
	
	
	vp.jQ.fn.filter_panel = function(options){
		var $vpfp, _o, _filterStack = null, _currentSection = ""
		
		$vpfp = this
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Filter Panel Starting",'info')
			_setup_events()
			return $vpfp
		}
		
		function _setup_events(){
			vp.events.bind('sectionOpened',_sectionOpenedHandler)
			vp.events.bind('relatedFacetsLoaded',_relatedFacetsLoadedHandler)
			vp.events.bind('nCommentsLoaded',_nCommentsLoadedEventHandler)
			vp.events.bind('filterStackModified',_filterStackModifiedHandler)
			vp.events.bind('updateSentiMeter',_updateSentiMeterEventHandler)
			vp.events.bind('readmodalOpening',_readmodalOpeningEventHandler)
			vp.events.bind('readmodalClosing',_readmodalClosingEventHandler)
			vp.events.bind('aboutmodalOpening',_aboutmodalOpeningEventHandler)
			vp.events.bind('aboutmodalClosing',_aboutmodalClosingEventHandler)
		}
		
		function _sectionOpenedHandler(e,d){
			if(d.sectionName){
				if(d.sectionName == 'universe' || d.sectionName == 'dashboard'){
					_filterStack = null
					$vpfp.find('#filter0').text("")
					_clearRelatedFacetsList()
					_close()
				} else if (d.sectionName == 'readmodal'){
					//_filterStack = null
					_close()
				} else if(d.sectionName == "about"){
					_close()
				} else if(_currentSection != d.sectionName){
					_open()
				}
				_currentSection = d.sectionName
			}
			if(d.filterStack){
				_updateFilterList(d.filterStack)
			}
		}
		
		function _clearRelatedFacetsList(){
			$vpfp.find('#related_facets').children().unbind('click',_relatedFacetClickHandler).remove()
		}
		
		function _relatedFacetsLoadedHandler(e,d){
			//_clearRelatedFacetsList()
			if(d.related){
				var _added = 0
				for(var i = 0; i<d.related.length; i++){
					
					var _myLi = vp.config.filter_panel.related_facet.clone()
					if(_filterStack){
						if(_added > 6-_filterStack.length){
							break
						}
						if(_filterStack.indexOf(d.related[i]) == -1){
							var _myName = d.related[i]
							if(vp.data.names[d.related[i]]){
								_myName = vp.data.names[d.related[i]]
							}
							var _myTruncatedName = _myName
							if(_myTruncatedName.length > 25){
								_myTruncatedName = _myTruncatedName.substring(0,22)+"..."
							}
							_myLi.children('a').text(_myTruncatedName).attr('rel',d.related[i]).attr('title',"Add Filter: "+_myName)
							_myLi.appendTo($vpfp.find('#related_facets'))
							_myLi.children('a').bind('click',_relatedFacetClickHandler)
							_added++
						}
					}
				}
			}
		}
		
		function _nCommentsLoadedEventHandler(e,d){
			if(d.nComments){
				$vpfp.find('#displayTitleHolder h3 span').text(d.nComments)
			}
		}
		
		function _filterStackModifiedHandler(e,d){
			if(d.filterStack){
				_updateFilterList(d.filterStack)
			}
		}
		
		function _updateFilterList(filterStack){
			vp.util.dump('filter_panel._updateFilterList')
			_filterStack = filterStack
			$vpfp.find('#selected_facets').children().unbind('click',_selectedFacetClickHandler).remove()
			$vpfp.find('#related_facets').children().unbind('click',_relatedFacetClickHandler).remove()
			for(var i in filterStack){
				var _myName = filterStack[i]
				if(vp.data.names[filterStack[i]]){
					_myName = vp.data.names[filterStack[i]]
				}
				var _myTruncatedName = _myName
				if(_myTruncatedName.length > 25){
					_myTruncatedName = _myTruncatedName.substring(0,22)+"..."
				}
				if(i == 0){
					$vpfp.find('#filter0').text(_myName)
				} else {
					var _myLi = vp.config.filter_panel.selected_facet.clone()
					_myLi.children('a').text(_myTruncatedName).attr('rel',filterStack[i]).attr('title',"Remove Filter: "+_myName)
					$vpfp.find('#selected_facets').append(_myLi)
					_myLi.children('a').bind('click',_selectedFacetClickHandler)
				}
			}
		}
		
		function _updateSentiMeterEventHandler(e,d){
			$vpfp.find('.evaMeter .pos').text(d.n_positive+" Positive Words")
			$vpfp.find('.evaMeter .neg').text(d.n_negative+" Negative Words")
			var _pctTop = 15 + (50 - (d.ratio  * 50))
			$vpfp.find('.evaMeter .evaMarker').stop().css('backgroundColor',"#"+vp.util.fadeColorsForRatio(d.ratio,vp.config.color.positive,vp.config.color.neutral,vp.config.color.negative)).animate({top:(80-_pctTop)+'%'},800)
			if(d.ratio < 0.5){
				$vpfp.find('.evaMeter .evaMarker h4').text((100-vp.util.round(d.ratio,2)*100)+"% Positive")
			} else {
				$vpfp.find('.evaMeter .evaMarker h4').text((vp.util.round(d.ratio,2)*100)+"% Negative")
			}
			
		}
		
		function _readmodalOpeningEventHandler(e,d){
			if(_currentSection != 'universe' && _currentSection != 'dashboard' && _currentSection != 'readmodal' && _currentSection != 'about'){
				_close()
			}
		}
		
		function _readmodalClosingEventHandler(e,d){
			if(_currentSection != 'universe' && _currentSection != 'dashboard' && _currentSection != 'readmodal' && _currentSection != 'about'){
				_open()
			}
		}
		
		function _aboutmodalOpeningEventHandler(e,d){
			if(_currentSection != 'universe' && _currentSection != 'dashboard' && _currentSection != 'readmodal' && _currentSection != 'about'){
				_close()
			}
		}
		
		function _aboutmodalClosingEventHandler(e,d){
			if(_currentSection != 'universe' && _currentSection != 'dashboard' && _currentSection != 'readmodal' && _currentSection != 'about'){
				_open()
			}
		}
		
		function _selectedFacetClickHandler(e){
			e.preventDefault()
			e.stopPropagation()
			_clearRelatedFacetsList()
			vp.events.trigger('filterKeyRemoved',{key:e.target.rel})
		}
		
		function _relatedFacetClickHandler(e){
			e.preventDefault()
			e.stopPropagation()
			_clearRelatedFacetsList()
			vp.events.trigger('filterKeyAdded',{key:e.target.rel})
		}
		
		function _open(){
			vp.util.dump('filter_panel._open')
			$vpfp.stop().animate({'left':'-25px'},600)
		}
		
		$vpfp.close = function(){
			$vpfp.css('left','-270px')
		}
		
		function _close(){
			$vpfp.stop().animate({'left':'-270px'},600)
		}
		
		return _initialize()
	}
})(vp);