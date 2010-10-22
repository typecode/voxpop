/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config.dashboard['center'] = {}
	vp.config.dashboard.center['base'] = vp.jQ('<div id="content"></div>')
	vp.config.dashboard.center['header'] = vp.jQ('<h2><span class="text"></span><span class="nMeta"></span></h2>')
	vp.config.dashboard.center['list'] = vp.jQ('<ul class="conversation"></ul>')
	
	vp.config.dashboard.center['article'] = {}
	vp.config.dashboard.center.article['base'] = vp.jQ('<li class="article"><div class="aHolder"></div><div class="sentiment"></div><ul class="commentList"></ul></li>')
	vp.config.dashboard.center.article['title'] = vp.jQ('<h3><a target="_blank" href="#"></a> <span class="nMeta"></span></h3>')
	vp.config.dashboard.center.article['show_hide'] = vp.jQ('<div class="showHide"><a href="#">Hide</a></div>')
	vp.config.dashboard.center.article['meta'] = vp.jQ('<h4 class="meta"><strong></strong><span class="content"></span></h4>')
	vp.config.dashboard.center.article['sentiment'] = vp.jQ('<div><div class="posNum"></div><div class="negNum"></div></div')
	
	vp.config.dashboard.center['comment'] = {}
	vp.config.dashboard.center.comment['base'] = vp.jQ('<li class="comment"><div class="cHolder"></div><div class="sentiment"></div></li>')
	vp.config.dashboard.center.comment['sequence'] = vp.jQ('<h5></h5>')
	vp.config.dashboard.center.comment['show_hide'] = vp.jQ('<div class="showHide"><a href="#">Show Comments</a></div>')
	vp.config.dashboard.center.comment['body'] = vp.jQ('<div class="cBody"></div>')
	vp.config.dashboard.center.comment['sentiment'] = vp.jQ('<div class="meta"><div class="posNum"></div><div class="negNum"></div></div>')
	
	vp.fn.dashboardContent = function(options){
		var vpdbc, _o, _myDisplay
		
		vpdbc = this
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Dashboard Content Initializing")
			_setup_events()
			return vpdbc
		}
		
		function _setup_events(){
			vp.events.unbind('dashboardEvent').bind('dashboardEvent',_dashboardEventHandler)
		}
		
		function _buildDisplay(){
			_myDisplay = vp.config.dashboard.center.base.clone()
		}
		
		function _dashboardEventHandler(e,d){
			if(d.eventName){
				if(d.eventName == 'cacheLinkClicked'){
					_myDisplay.children().remove()
					_myDisplay.append(vp.config.dashboard.loader.clone())
					_loadDataForKey(d.key,_populateContent)
				}
			}
		}
		
		function _loadDataForKey(key,callback){
			function success(d, ts){
				if(typeof callback == 'function'){
					callback(d)
				}
			}
			function error(xhr, ts, ec){
				
			}
			vp.resources.getResource("/dashboard/children/"+key, {}, success, error)
		}
		
		function _populateContent(data){
			_myDisplay.children().remove()
			var __header = vp.config.dashboard.center.header.clone()
			if(data.doc.name){
				__header.children("span.text").text(data.doc.name)
			}
			if(data.doc.stats){
				if(data.doc.stats.nlp){
					if(data.doc.stats.nlp.lasswell_words){
						var _ratio = data.doc.stats.nlp.lasswell_words.n_positive / (data.doc.stats.nlp.lasswell_words.n_negative+data.doc.stats.nlp.lasswell_words.n_positive)
						__header.css('borderColor',"#"+vp.util.fadeColorsForRatio(_ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive))
					}
				}
				if(data.doc.stats.counts){
					if(data.doc.stats.counts.article){
						__header.children("span.nMeta").text("("+data.doc.stats.counts.article+" article)")
					}
				}
			}
			
			_myDisplay.append(__header)
			_myDisplay.append(vp.config.dashboard.center.list.clone())
			for(var i in data.rows){
				var _myArticle = vp.config.dashboard.center.article.base.clone()
				
				var _myTitle = vp.config.dashboard.center.article.title.clone()
				_myTitle.children('a').text(data.rows[i].title)
				if(data.rows[i].stats){
					if(data.rows[i].stats.counts){
						if(data.rows[i].stats.counts.comment){
							_myTitle.append('<span>('+data.rows[i].stats.counts.comment+' comments)</span>')
						}
					}
				}
				if(data.rows[i].url){
					_myTitle.children('a').attr('href',data.rows[i].url)
				}
				_myArticle.children('.aHolder').append(_myTitle)
				
				var _myControls = vp.config.dashboard.center.article.show_hide.clone()
				_myControls.children('a').text('Show Comments').attr('rel',data.rows[i]._id)
				_myControls.children('a').bind('click',_showHideClickHandler)
				_myArticle.children('.aHolder').append(_myControls)
				
				var _seeOn = vp.config.dashboard.center.article.meta.clone()
				_seeOn.children("strong").text("See on:")
				_seeOn.children('span').append("<a target='voxpop' href='#map,"+data.rows[i]._id+"'>Map</a> <a target='voxpop' href='#chart,"+data.rows[i]._id+"'>Timeline</a> ")
				_myArticle.children('.aHolder').append(_seeOn)
				
				if(data.rows[i].des_facet){
					var _myMeta = vp.config.dashboard.center.article.meta.clone()
					_myMeta.children("strong").text("Description Facets:")
					for(var j in data.rows[i].des_facet){
						_myMeta.children('span').append(data.rows[i].des_facet[j]+", ")
					}
					_myArticle.children('.aHolder').append(_myMeta)
				}
				if(data.rows[i].geo_facet){
					var _myMeta = vp.config.dashboard.center.article.meta.clone()
					_myMeta.children("strong").text("Geographic Facets:")
					for(var j in data.rows[i].geo_facet){
						_myMeta.children('span').append(data.rows[i].geo_facet[j]+", ")
					}
					_myArticle.children('.aHolder').append(_myMeta)
				}
				if(data.rows[i].per_facet){
					var _myMeta = vp.config.dashboard.center.article.meta.clone()
					_myMeta.children("strong").text("Person Facets:")
					for(var j in data.rows[i].per_facet){
						_myMeta.children('span').append(data.rows[i].per_facet[j]+", ")
					}
					_myArticle.children('.aHolder').append(_myMeta)
				}
				if(data.rows[i].org_facet){
					var _myMeta = vp.config.dashboard.center.article.meta.clone()
					_myMeta.children("strong").text("Org Facets:")
					for(var j in data.rows[i].org_facet){
						_myMeta.children('span').append(data.rows[i].org_facet[j]+", ")
					}
					_myArticle.children('.aHolder').append(_myMeta)
				}
				if(data.rows[i].body){
					var _myMeta = vp.config.dashboard.center.article.meta.clone()
					_myMeta.children("strong").text("Body:")
					_myMeta.children('span').text(data.rows[i].body)
					_myArticle.children('.aHolder').append(_myMeta)
				}
				if(data.rows[i].stats){
					if(data.rows[i].stats.nlp){
						if(data.rows[i].stats.nlp.lasswell_words){
							if(data.rows[i].stats.nlp.lasswell_words.positive && data.rows[i].stats.nlp.lasswell_words.negative){
								var _mySentiment = vp.config.dashboard.center.article.sentiment.clone()
								_mySentiment.children(".posNum").text("Positive: "+data.rows[i].stats.nlp.lasswell_words.n_positive).css('borderColor','#'+vp.config.color.positive)
								_mySentiment.children(".negNum").text("Negative: "+data.rows[i].stats.nlp.lasswell_words.n_negative).css('borderColor','#'+vp.config.color.negative)
								_myArticle.children('.aHolder').append(_mySentiment)
								var _ratio = data.rows[i].stats.nlp.lasswell_words.n_positive / (data.rows[i].stats.nlp.lasswell_words.n_negative+data.rows[i].stats.nlp.lasswell_words.n_positive)
								if(isNaN(_ratio)){
									_ratio = 0.5
								}
								_myArticle.children('.sentiment').css('backgroundColor',"#"+vp.util.fadeColorsForRatio(_ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive))
							} else {
								_myArticle.children('.sentiment').css('backgroundColor',"#"+vp.config.color.neutral)
							}
						}
					}
				}
				
				_myArticle.css('opacity',0.0).appendTo(_myDisplay.children(".conversation")).animate({'opacity':1.0})
			}
		}
		
		function _populateComments(target,data){
			target.children().remove()
			for(var i in data.rows){
				var _myComment = vp.config.dashboard.center.comment.base.clone()
				if(data.rows[i].commentSequence){
					if(data.n_children){
						var _commentSequence = vp.config.dashboard.center.comment.sequence.clone()
						_commentSequence.text("Comment "+data.rows[i].commentSequence+" of "+data.n_children)
						_myComment.children(".cHolder").append(_commentSequence)
					}
				}
				if(data.rows[i].commentBody){
					var _commentBody = vp.config.dashboard.center.article.meta.clone()
					_commentBody.children("strong").text("Body:")
					var _highlightedCommentBody = data.rows[i].commentBody
					if(data.rows[i].stats){
						if(data.rows[i].stats.nlp){
							if(data.rows[i].stats.nlp.lasswell_words){
								_highlightedCommentBody = _highlightText(data.rows[i].commentBody,data.rows[i].stats.nlp.lasswell_words)
							}
						}
					}
					_commentBody.children('span').html(_highlightedCommentBody)
					_myComment.children(".cHolder").append(_commentBody)
				}
				if(data.rows[i].stats){
					if(data.rows[i].stats.nlp){
						if(data.rows[i].stats.nlp.lasswell_words){
							if(data.rows[i].stats.nlp.lasswell_words.positive && data.rows[i].stats.nlp.lasswell_words.negative){
								var _myPos = vp.config.dashboard.center.article.meta.clone()
								_myPos.children('strong').text("Positive Words:")
								for(var j in data.rows[i].stats.nlp.lasswell_words.positive){
									_myPos.children('span').append(j+"("+data.rows[i].stats.nlp.lasswell_words.positive[j]+") ")
								}
								//_myComment.children(".cHolder").append(_myPos)
								var _myNeg = vp.config.dashboard.center.article.meta.clone()
								_myNeg.children('strong').text("Negative Words:")
								for(var j in data.rows[i].stats.nlp.lasswell_words.negative){
									_myNeg.children('span').append(j+"("+data.rows[i].stats.nlp.lasswell_words.negative[j]+") ")
								}
								//_myComment.children(".cHolder").append(_myNeg)
								var _mySentiment = vp.config.dashboard.center.comment.sentiment.clone()
								_mySentiment.children(".posNum").text("Positive: "+data.rows[i].stats.nlp.lasswell_words.n_positive).css('borderColor','#'+vp.config.color.positive)
								_mySentiment.children(".negNum").text("Negative: "+data.rows[i].stats.nlp.lasswell_words.n_negative).css('borderColor','#'+vp.config.color.negative)
								_myComment.children(".cHolder").append(_mySentiment)
								var _ratio = data.rows[i].stats.nlp.lasswell_words.n_positive / (data.rows[i].stats.nlp.lasswell_words.n_negative+data.rows[i].stats.nlp.lasswell_words.n_positive)
								if(isNaN(_ratio)){
									_ratio = 0.5
								}
								var _myRatio = vp.config.dashboard.center.article.meta.clone()
								_myRatio.children('strong').text("ratio:")
								_myRatio.children('span').text(_ratio)
								//_myComment.children(".cHolder").append(_myRatio)
								_myComment.children('.sentiment').css('backgroundColor',"#"+vp.util.fadeColorsForRatio(_ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive))
								//_myComment.children('.sentiment').css('backgroundColor',"#"+vp.util.colorFade('0x'+vp.config.color.negative,'0x'+vp.config.color.positive,_ratio).toString(16))
							}	
						}
					}
				}
				target.append(_myComment)
			}
		}
		
		function _highlightText(text,values){
			var _myText = text
			if(values.positive){
				for(var i in values.positive){
					var _myReg = new RegExp(i+"\\b", 'gi')
					_myText = _myText.replace(_myReg,"<span style='background-color:rgba("+vp.util.getRGBFromHex('r',vp.config.color.positive)+","+vp.util.getRGBFromHex('g',vp.config.color.positive)+","+vp.util.getRGBFromHex('b',vp.config.color.positive)+",0.5);'>"+i+"</span>")
				}
			}
			if(values.negative){
				for(var i in values.negative){
					var _myReg = new RegExp(i+"\\b", 'gi')
					_myText = _myText.replace(_myReg,"<span style='background-color:rgba("+vp.util.getRGBFromHex('r',vp.config.color.negative)+","+vp.util.getRGBFromHex('g',vp.config.color.negative)+","+vp.util.getRGBFromHex('b',vp.config.color.negative)+",0.5);'>"+i+"</span>")
				}
			}
			return _myText
		}
		
		function _showHideClickHandler(e){
			e.preventDefault()
			function _dataLoaded(d){
				_populateComments(_target,d)
				_target.data('loaded',true)
			}
			var _button = vp.jQ(e.target)
			var _target = _button.parent().parent().parent().children('.commentList')
			if(!_button.data('visible')){
				_button.text("Hide Comments")
				if(_target.data('loaded')){
					_button.data('visible',true)
					_target.show()
				} else {
					_target.children().remove()
					_target.append(vp.config.dashboard.loader.clone())
					_button.data('visible',true)
					_loadDataForKey(e.target.rel,_dataLoaded)
				}
			} else {
				_button.text("Show Comments")
				_target.hide()
				_button.data('visible',false)
			}
		}
		
		vpdbc.getDisplay = function(){
			if(!_myDisplay){
				_buildDisplay()
			}
			return _myDisplay
		}
		
		return _initialize()
	}
})(vp);