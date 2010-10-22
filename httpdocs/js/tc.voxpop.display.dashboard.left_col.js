/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config.dashboard['left_col'] = {}
	vp.config.dashboard.left_col['base'] = vp.jQ('<div id="leftCol"></div>')
	vp.config.dashboard.left_col['section'] = vp.jQ('<div class="section"<h2><span></span>&nbsp;&nbsp;&nbsp;»</h2><ul class="topics"></ul></div>')
	vp.config.dashboard.left_col['sections'] = [
			{name:'Descriptive', objName: 'des'},
			{name:'Geographic', objName: 'geo'},
			{name:'Person', objName: 'per'},
			{name:'Organizaton', objName: 'org'}
		]
	vp.config.dashboard.left_col['list_item'] = vp.jQ('<li><a href="#" class="section_name"></a> <span class="nMeta"></span></li>')
		
	vp.fn.dashboardLeftCol = function(options){
		var vpdblc, _o, _myDisplay
		
		vpdblc = this
		_o = vp.jQ.extend({
			n_items:10
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Dashboard Left Col Initializing")
			return vpdblc
		}
		
		function _buildDisplay(){
			_myDisplay = vp.config.dashboard.left_col.base.clone()
			_fetchFacets(_populateLeftNav)
		}
		
		function _fetchFacets(callback){
			function success(d, ts){
				if(typeof callback == 'function'){
					callback(d)
				}
			}
			function error(xhr, ts, ec){
				
			}
			_myDisplay.children().remove()
			_myDisplay.append(vp.config.dashboard.loader.clone())
			vp.resources.getResource("/dashboard/facets", {}, success, error)
		}
		
		function _populateLeftNav(data,callback){
			_myDisplay.children().remove()
			for(i in vp.config.dashboard.left_col.sections){
				if(data[vp.config.dashboard.left_col.sections[i].objName] && data[vp.config.dashboard.left_col.sections[i].objName+"_dist"]){
					var _mySection = vp.config.dashboard.left_col.section.clone()
					_mySection.children("h2").children("span").text(vp.config.dashboard.left_col.sections[i].name+" Facets")
					var _nAdded = 0
					for(var j in data[vp.config.dashboard.left_col.sections[i].objName+"_dist"]){
						if(_nAdded >= _o.n_items){
							break
						}
						var _myKey = data[vp.config.dashboard.left_col.sections[i].objName+"_dist"][j]
						var _myItem = vp.config.dashboard.left_col.list_item.clone()
						_myItem.children('.section_name').text(data[vp.config.dashboard.left_col.sections[i].objName][_myKey].key).attr('href',"#"+data[vp.config.dashboard.left_col.sections[i].objName][_myKey].id)
						if(data[vp.config.dashboard.left_col.sections[i].objName][_myKey].value){
							if(data[vp.config.dashboard.left_col.sections[i].objName][_myKey].value.counts){
								if(data[vp.config.dashboard.left_col.sections[i].objName][_myKey].value.counts.comment){
									_myItem.children('.nMeta').text("("+data[vp.config.dashboard.left_col.sections[i].objName][_myKey].value.counts.comment+" comments)")
								}
							}
							if(data[vp.config.dashboard.left_col.sections[i].objName][_myKey].value.nlp){
								if(data[vp.config.dashboard.left_col.sections[i].objName][_myKey].value.nlp.lasswell_words){
									var _ratio = data[vp.config.dashboard.left_col.sections[i].objName][_myKey].value.nlp.lasswell_words.n_positive / (data[vp.config.dashboard.left_col.sections[i].objName][_myKey].value.nlp.lasswell_words.n_negative + data[vp.config.dashboard.left_col.sections[i].objName][_myKey].value.nlp.lasswell_words.n_positive)
									if(isNaN(_ratio)){
										_ratio = 0.5
									}
									//_myItem.children('.nMeta').append("(Ratio:"+_ratio+")")
									_myItem.css('borderColor',"#"+vp.util.fadeColorsForRatio(_ratio,vp.config.color.negative,vp.config.color.neutral,vp.config.color.positive))
								}
							}
						}
						_mySection.children(".topics").append(_myItem)
						_nAdded++
					}
					_mySection.css('opacity',0.0).appendTo(_myDisplay).animate({'opacity':1.0})
				}
			}
			_myDisplay.find('a').unbind('click').bind('click',_leftColLinkClickHandler)
		}
		
		function _leftColLinkClickHandler(e,d){
			e.preventDefault()
			var __key = e.target.hash.substring(1,e.target.hash.length)
			vp.events.trigger('dashboardEvent',{eventName:'cacheLinkClicked',key:__key})
		}
		
		vpdblc.getDisplay = function(){
			if(!_myDisplay){
				_buildDisplay()
			}
			return _myDisplay
		}
		
		return _initialize()
	}
})(vp);