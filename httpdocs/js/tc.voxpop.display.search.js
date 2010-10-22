/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config['search'] = {}
	vp.config.search['base'] = vp.jQ("<div id='search'>&nbsp;&nbsp;&nbsp;This is not for you.<form id='topic_query_form'><input type='text' class='field' name='query' value='' /><button type='submit' name='submit' value='Submit' class='submit'>&nbsp;</button></form></div>")
		
	vp.fn.search = function(options){
		var vps, _o, _myDisplay;
		
		vps = this
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Search Initializing")
			_buildDisplay()
			return vps
		}
		
		function _buildDisplay(){
			_myDisplay = vp.config.search.base.clone()
			_myDisplay.find("form").bind("submit",_searchFormSubmitHandler)
		}
		
		function _searchFormSubmitHandler(e){
			e.preventDefault()
			vp.util.log("VoxPop Query Submitted",'info')
			vp.events.trigger("searchSubmitted",{query:_myDisplay.find('input[name="query"]').attr("value"), type:'articles'})
			_myDisplay.find('input[name="query"]').attr("value","")
		}
		
		vps.getDisplay = function(){
			return _myDisplay
		}
		
		vps.update = function(data){
			
		}
		
		return _initialize()
	}
})(vp);