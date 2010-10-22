/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.jQ.fn.search = function(options){
		var $vps, _o
		
		$vps = this
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Search Panel Starting",'info')
			_setup_events()
		}
		
		function _setup_events(){
			$vps.find("form").bind("submit",_searchFormSubmitHandler)
			vp.events.bind('topicsLoaded',_topicsLoadedEventHandler)
		}
		
		function _searchFormSubmitHandler(e){
			e.preventDefault()
			vp.util.log("VoxPop Query Submitted",'info')
			vp.events.trigger("searchSubmitted",{query:$vps.find('input[name="query"]').attr("value"), type:'articles'})
			$vps.find('input[name="query"]').attr("value","")
		}
		
		function _topicsLoadedEventHandler(e,d){
			
		}
		
		_initialize()
		return $vps
	}
})(vp);