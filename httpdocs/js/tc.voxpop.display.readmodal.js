/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config['readmodal'] = {}
	vp.config.readmodal['base'] = vp.jQ('<div class="readModal"><div class="rmOverlay"></div><div class="rmContent"></div></div>')
	vp.config.readmodal['meta'] = {}
	vp.config.readmodal.meta['base'] = vp.jQ('<div class="rmMeta"></div>')
	vp.config.readmodal.meta['header'] = vp.jQ('<div class="metaHeader"><a class="closeModal" href="#">Close Comments</a></div>')
	vp.config.readmodal.meta['details'] = vp.jQ('<div class="metaDetails">'+
											'<h3><span class="nComments"></span> Comments about</h3>'+
											"<h1 id='filter0'></h1>"+
											"<ul class='filterFacets' id='selected_facets'></ul>"+
											"<h3 class='location'>from readers in</h3><h2 class='location'></h2>"+
										"</div>")
	vp.config.readmodal.meta['relatedFacet'] = vp.jQ('<li class="selectedFacet"><span></span></li>')
	vp.config.readmodal.meta['relatedFacet_a'] = vp.jQ('<li class="selectedFacet"><a class="dsBtn" title="Remove this filter" href="#" /><span></span></li>')
	vp.config.readmodal.meta['evaMeter'] = vp.jQ('<div class="evaMeter">'+
												'<h3 class="pos">#### Positive Words</h3>'+
												'<div class="evaMarker">'+
													'<h3 class="eM">Overall Sentiment</h3>'+
													'<h4>##% Positive</h4>'+
												'</div>'+
												'<h3 class="neg">#### Negetive Words</h3>'+
											'</div>')
	vp.config.readmodal['comments'] = {}
	vp.config.readmodal.comments['base'] = vp.jQ('<div class="rmComments"><ul class="rmArticleList"></ul></div>')
	vp.config.readmodal.comments['article'] = {}
	vp.config.readmodal.comments.article['base'] = vp.jQ('<li class="rmArticle"></li>')
	vp.config.readmodal.comments.article['header'] = vp.jQ('<div class="rmArticleHeader">'+
																'<div class="rmaTitle">'+
																	'<h1><a href="#" target="_blank"></a></h1>'+
																	'<h3><span class="byline"></span> &nbsp;&nbsp;&nbsp;&nbsp; <A href="#" class="abstractToggle">Read Abstract</A> &nbsp;&nbsp;&nbsp;&nbsp; <a class="nytLink" target="_blank" href="#">Article on NY Times</a></h3>'+
																	'<div class="rmaAbstract">'+
																		'<p></p>'+
																		'<h3><a href="#" class="abstractToggle">Hide Abstract</a></h3>'+
																	'</div>'+
																'</div>'+
															'</div>')
	vp.config.readmodal.comments.article['comments'] = vp.jQ('<ul class="rmaComments"></ul>')
	vp.config.readmodal.comments['comment'] = vp.jQ('<li class="rComment">'+
														'<div class="cbTop"></div>'+
														'<div class="cbMid">'+
															'<p>CONTENT GOES HERE</p>'+
														'</div>'+
														'<div class="cbBottom"></div>'+
														'<div class="cAuthor">'+
															'<h2><span class="evaValue"></span>&nbsp;from <span class="geo"></span> at <span class="timestamp"></span></h2>'+
														'</div>'+
													'</li>')
	
	
		
	vp.fn.readmodal = function(options){
		var rm = this, _o = {}, _myDisplay = null, _req = null, _data = {}, _articles = {}, _panel_open = false, _location = null, _currentElement = null, _abstractOpen = null;
		
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Readmodal Initializing")
			_buildDisplay()
			_setup_events()
			return rm
		}
		
		function _setup_events(){
			vp.events.bind('sectionOpened',_sectionOpenedHandler)
			vp.events.bind('openReadmodalWithKey',_openReadmodalWithKeyEventHandler)
			vp.events.bind('openReadmodalForKeys',_openReadmodalForKeysEventHandler)
			vp.events.bind('openReadmodalForArticleId',_openReadmodalForArticleIdEventHandler)
			_myDisplay.find('.closeModal').bind('click',_closeButtonClickHandler)
		}
		
		function _sectionOpenedHandler(e,d){
			if(_panel_open){
				_close(true)
			}
		}
		
		function _openReadmodalWithKeyEventHandler(e,d){
			if(d.key){
				_clear()
				_myDisplay.find('.metaDetails').find('.location').show()
				_location = true
				_myDisplay.find('ul.rmArticleList').addClass('loading')
				_loadContentForKey(d.key)
				_updateMetaForData({key:d.key})
				_open(true)
			}
		}
		
		function _openReadmodalForKeysEventHandler(e,d){
			if(d.commentIds && d.key){
				_clear()
				_myDisplay.find('.metaDetails').find('.location').hide()
				_location = false
				_myDisplay.find('ul.rmArticleList').addClass('loading')
				_updateMetaForData({keyArray:d.key})
				_loadContentForIds(d.id,d.commentIds)
				_open(true)
			}
		}
		
		function _openReadmodalForArticleIdEventHandler(e,d){
			if(d.articleId && d.key){
				_clear()
				_myDisplay.find('.metaDetails').find('.location').hide()
				_location = false
				_myDisplay.find('ul.rmArticleList').addClass('loading')
				_updateMetaForData({keyArray:d.key})
				_loadContentForArticleId(d.articleId)
				_open(true)
			}
		}
		
		function _clear(){
			_currentElement = null
			for(var i in _articles){
				_articles[i].find('.abstractLink').unbind('click',_articleAbstractToggleClickHandler)
				_articles[i].remove()
				delete _articles[i]
			}
			_myDisplay.find('.metaDetails').find('.nComments').text('')
			_myDisplay.find('.evaMeter .pos').text('--- Positive Words')
			_myDisplay.find('.evaMeter .neg').text('--- Negative Words')
			_myDisplay.find('.evaMarker').css('top','40%')
			_myDisplay.find('.evaMeter h4').text("")
			_myDisplay.find('.filterFacets').children().remove()
		}
		
		function _updateMetaForData(data){
			
			if(data.n_positive || data.n_positive == 0){
				_myDisplay.find('.evaMeter .pos').text(data.n_positive+' Positive Words')
			}
			if(data.n_negative || data.n_negative == 0){
				_myDisplay.find('.evaMeter .neg').text(data.n_negative+' Negative Words')
			}
			if(data.ratio || data.ratio == 0){
				var _ratio = data.ratio
				var _pctTop = 15 + (50 - (_ratio * 50))
				_myDisplay.find('.evaMarker').css('backgroundColor',"#"+vp.util.fadeColorsForRatio(_ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive)).animate({top:_pctTop+'%'},500)
				if(data.ratio > 0.5){
					_myDisplay.find('.evaMeter h4').text(Math.round(_ratio*100)+'% Positive')
				} else {
					_myDisplay.find('.evaMeter h4').text((100-Math.round(_ratio*100))+'% Negative')
				}
				
			}
			
			var _myKeyArray = null
			if(data.key){
				if(data.key.indexOf(',') != -1){
					_myKeyArray = data.key.split(',')
				} else {
					_myKeyArray = [data.key]
				}
			}
			
			if(data.keyArray){
				_myKeyArray = data.keyArray
			}
			
			if(_myKeyArray){
				var _p = 0
				for(var i in _myKeyArray){
					var _myName = _myKeyArray[i]
					if(vp.data.names[_myKeyArray[i]]){
						_myName = vp.data.names[_myKeyArray[i]]
					}
					if(_p == 0){
						_myDisplay.find('#filter0').text(_myName)
					} else if(_p < _myKeyArray.length-1) {
						var _myFacet = vp.config.readmodal.meta.relatedFacet.clone()
						_myFacet.children('span').text(_myName)
						_myDisplay.find('.filterFacets').append(_myFacet)
					} else {
						if(_location){
							_myDisplay.find('.metaDetails .location').text(_myName)
						} else {
							var _myFacet = vp.config.readmodal.meta.relatedFacet.clone()
							_myFacet.children('span').text(_myName)
							_myDisplay.find('.filterFacets').append(_myFacet)
						}
					}
					_p++
				}
			}
		}
		
		function _loadContentForKey(key){
			function success(d, ts){
				_req = null
				if(d['code']){
					if(d['code'] == '404'){
						return false
					}
				}
				_data[key] = d
				_renderComments(_data[key])
				if(_data[key].aggregateSentiment){
					_updateMetaForData(_data[key].aggregateSentiment)
				}
			}
			function error(xhr, ts, ec){
				_req = null
			}
			if(_data[key]){
				_renderComments(_data[key])
				if(_data[key].aggregateSentiment){
					_updateMetaForData(_data[key].aggregateSentiment)
				}
			} else {
				if(_req){
					_req.abort()
				}
				_req = vp.resources.getResource("/readmodal/keys/"+key, {}, success, error)
			}
		}
		
		function _loadContentForIds(id,ids){
			function success(d, ts){
				_req = null
				if(d['code']){
					if(d['code'] == '404'){
						return false
					}
				}
				_data[id] = d
				_renderComments(_data[id])
				if(_data[id].aggregateSentiment){
					_updateMetaForData(_data[id].aggregateSentiment)
				}
				
			}
			function error(xhr, ts, ec){
				_req = null
			}
			if(_data[id]){
				_renderComments(_data[id])
				if(_data[id].aggregateSentiment){
					_updateMetaForData(_data[id].aggregateSentiment)
				}
			} else {
				if(_req){
					_req.abort()
				}
				_req = vp.resources.getResource("/readmodal/ids/"+id, {'ids':ids.join(',')}, success, error)
			}
		}
		
		function _loadContentForArticleId(aid){
			function success(d, ts){
				_req = null
				if(d['code']){
					if(d['code'] == '404'){
						return false
					}
				}
				_data[aid] = d
				_renderComments(_data[aid])
				if(_data[aid].aggregateSentiment){
					_updateMetaForData(_data[id].aggregateSentiment)
				}
				
			}
			function error(xhr, ts, ec){
				_req = null
			}
			if(_data[aid]){
				_renderComments(_data[aid])
				if(_data[aid].aggregateSentiment){
					_updateMetaForData(_data[aid].aggregateSentiment)
				}
			} else {
				if(_req){
					_req.abort()
				}
				_req = vp.resources.getResource("/readmodal/articleid/"+aid, {}, success, error)
			}
		}
		
		function _renderComments(data){
			_myDisplay.find('ul.rmArticleList').removeClass('loading')
			_myDisplay.find('.metaDetails').find('.nComments').text(data.comments.length)
			for(var i in data.comments){
				var c = data.comments[i]
				var _myArticle = _articles[c['article_id']]
				if(!_myArticle){
					var _myArticleData = data.articles[c['article_id']]
					if(!_myArticleData){
						vp.util.log('NO ARTICLE DATA FOR ARTICLE_ID:'+c['article_id'],'info')
					}
					if(_myArticleData.kind != 'article'){
						vp.util.log('THIS IS NOT AN ARTICLE, SILLY:'+c['article_id'],'info')
					}
					_myArticle = vp.config.readmodal.comments.article.base.clone()
					var _myHeader = vp.config.readmodal.comments.article.header.clone()
					_myHeader.find('.rmaTitle h1 a').text(_myArticleData['title']).attr('href',_myArticleData['url'])
					if(_o.exhibition){
						_myHeader.find('.rmaTitle h1 a').bind('click',function(e){ e.preventDefault(); })
					}
					_myHeader.find('span.byline').text(_myArticleData['byline'])
					_myHeader.find('.rmaTitle .nytLink').attr('href',_myArticleData['url'])
					_myHeader.find('.rmaAbstract').hide().children('p').html(_myArticleData['body'])
					_myHeader.find('.abstractToggle').bind('click',_articleAbstractToggleClickHandler)
					if(_o.exhibition){
						_myHeader.find('a.nytLink').remove()
					} else {
						_myHeader.find('a.nytLink').addClass('extLink')
					}
					_myArticle.append(_myHeader)
					_myArticle.append(vp.config.readmodal.comments.article.comments.clone())
					_articles[c['article_id']] = _myArticle
					_myArticle.css('opacity',0.0).appendTo(_myDisplay.find('ul.rmArticleList')).animate({'opacity':1.0},400)
				}
				var _myComment = vp.config.readmodal.comments.comment.clone()
				var _commentBody = c['value']['commentBody']
				if(c['value']['lasswell']){
					_commentBody = _highlightText(_commentBody,c['value']['lasswell'])
				}
				_myComment.find('.cbMid p').html(_commentBody)
				var _ratio = c['value']['lasswell']['positive'].length / (c['value']['lasswell']['positive'].length + c['value']['lasswell']['negative'].length)
				
				if(isNaN(_ratio)){
					_ratio = 0.5
				}
				_myComment.find('.evaValue').text(c['value']['display_name']).css('color',"#"+vp.util.fadeColorsForRatio(_ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive))
				
				_myComment.find('span.geo').text(c['value']['geo_name'])
				var _myDate = new Date(c['value']['approveDate'] * 1000)
				_myComment.find('span.timestamp').text(_myDate.toLocaleTimeString() + ' on ' + _myDate.toLocaleDateString())
				_myComment.hide().appendTo(_myArticle.children('.rmaComments')).slideToggle()
			}
		}
		
		function _highlightText(text,values){
			var _myText = text
			if(values.positive){
				for(var i in values.positive){
					var _myReg = new RegExp(values.positive[i]+"\\b", 'gi')
					_myText = _myText.replace(_myReg,"<span style='color:#"+vp.config.color.positive+";'>"+values.positive[i]+"</span>")
				}
			}
			if(values.negative){
				for(var i in values.negative){
					var _myReg = new RegExp(values.negative[i]+"\\b", 'gi')
					_myText = _myText.replace(_myReg,"<span style='color:#"+vp.config.color.negative+";'>"+values.negative[i]+"</span>")
				}
			}
			return _myText
		}
		
		function _articleAbstractToggleClickHandler(e){
			e.preventDefault()
			if(_abstractOpen){
				_closeAbstract(e.target)
			} else {
				_openAbstract(e.target)
			}
		}
		
		function _openAbstract(target){
			vp.util.dump('readmodal._openAbstract')
			var _targetHeight = 0, $_t = vp.jQ(target), _myAbstract = null
			
			if($_t.parent().parent().hasClass('rmaTitle')){
				_myAbstract = vp.jQ(target).parent().siblings('.rmaAbstract')
			} else {
				_myAbstract = vp.jQ(target).parent().parent()
			}
			_myAbstract.stop().show().children().each(function(e,j){
				_targetHeight += vp.jQ(j).outerHeight()
			})
			_abstractOpen = true
			_myAbstract.parent().find('.abstractToggle').text('Hide Abstract')
			_myAbstract.animate({height:_targetHeight},400)
		}
		
		function _closeAbstract(target){
			vp.util.dump('readmodal._closeAbstract')
			var $_t = vp.jQ(target), _myAbstract = null
			if($_t.parent().parent().hasClass('rmaTitle')){
				_myAbstract = vp.jQ(target).parent().siblings('.rmaAbstract')
			} else {
				_myAbstract = vp.jQ(target).parent().parent()
			}
			_abstractOpen = false
			_myAbstract.parent().find('.abstractToggle').text('Read Abstract')
			_myAbstract.stop().animate({height:0},400,function(){
				vp.jQ(this).hide()
			})
		}
		
		function _buildDisplay(){
			_myDisplay = vp.config.readmodal.base.clone()
			var _myMeta = vp.config.readmodal.meta.base.clone()
			_myMeta.append(vp.config.readmodal.meta.header.clone())
			_myMeta.append(vp.config.readmodal.meta.details.clone())
			_myMeta.append(vp.config.readmodal.meta.evaMeter.clone())
			_myMeta.appendTo(_myDisplay.children('.rmContent'))
			
			var _myComments = vp.config.readmodal.comments.base.clone()
			_myComments.appendTo(_myDisplay.children('.rmContent'))
		}
		
		function _closeButtonClickHandler(e){
			e.preventDefault()
			_close(true)
		}
		
		function _keypressHandler(e){
			if(e.which == 0){ // 'esc' close
				e.stopPropagation()
				e.preventDefault()
				_close(true)
			}
			if(e.which == 106){ // '+' zoom in
				e.stopPropagation()
				_scrollToNext()
			}
			if(e.which == 107){ // '-' zoom out
				e.stopPropagation()
				_scrollToPrevious()
			}
		}
		
		function _scrollToNext(){
			if(!_currentElement){
				if(_currentElement == 0){
					_currentElement = 1
				} else {
					_currentElement = 0
				}
			} else {
				if(_currentElement < _myDisplay.find('.rmArticleHeader, .rComment').length - 1){
					_currentElement = _currentElement + 1
				}
			}
			vp.jQ('body').scrollTo(_myDisplay.find('.rmArticleHeader, .rComment').eq(_currentElement),400,{offset:-60})
		}
		
		function _scrollToPrevious(){
			if(!_currentElement){
				_currentElement = 0
			} else {
				_currentElement = _currentElement - 1
			}
			vp.jQ('body').scrollTo(_myDisplay.find('.rmArticleHeader, .rComment').eq(_currentElement),400,{offset:-60})
		}
		
		rm.open = function(animate){
			_open(animate)
			return rm
		}
		
		function _open(animate){
			vp.util.dump('readmodal._open')
			vp.events.trigger('readmodalOpening',{})
			vp.jQ(document).bind('keypress',_keypressHandler)
			vp.jQ('body').css('overflowY','auto')
			if(animate){
				vp.util.dump('readmodal._open.animate')
				_myDisplay.children('.rmOverlay').css('opacity',1.0)
				_myDisplay.children('.rmContent').css('opacity',0.0)
				_myDisplay.show()
				_myDisplay.children('.rmContent').animate({'opacity':1.0},600,function(){ _panel_open = true; })
			} else {
				_myDisplay.show().css('opacity',1.0)
				_panel_open = true
			}
		}
		
		rm.close = function(animate){
			_close(animate)
			return rm
		}
		
		function _close(animate){
			vp.util.dump('readmodal._close')
			vp.events.trigger('readmodalClosing',{})
			vp.jQ(document).unbind('keypress',_keypressHandler)
			vp.jQ('body').css('overflowY','hidden')
			if(_req){
				_req.abort()
			}
			if(animate){
				vp.util.dump('readmodal._close.animate')
				_myDisplay.children('.rmOverlay').css('opacity',0.0)
				_myDisplay.children('.rmContent').animate({'opacity':0.0},500,function(){
					_myDisplay.hide()
					_panel_open = false
				})
			} else {
				_myDisplay.hide()
				_panel_open = false
			}
		}
		
		rm.getDisplay = function(){
			return _myDisplay
		}
		
		rm.update = function(data){
			
		}
		
		return _initialize()
	}
})(vp);