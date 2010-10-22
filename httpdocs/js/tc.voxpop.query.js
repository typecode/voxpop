/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.fn.query = function(options){
		var vpq, _o, _queried
		
		vpq = this
		_o = vp.jQ.extend({
			query:null,
			type:null
		},options)
		
		function _initialize(){
			if(_o.query == null || _o.query == ""){
				return false
			} else if(_o.type == null || _o.type == ""){
				return false
			} else {
				vp.util.log("VoxPop Query Initializing ["+_o.query+"]",'info')
				_queried = false
				_post_query_request()
			}
		}
		
		function _post_query_request(){
			function _success(d,ts){
				vp.events.trigger("queryPosted",d)
				_queried = true
				_get_query_results()
			}
			function _error(x,t,m){
				
			}
			vp.resources.postResource("/query/"+_o.type+"/"+_o.query,{},_success,_error)
		}
		
		function _get_query_results(){
			function _success(d,ts){
				vp.events.trigger("queryFetched",d)
				vp.util.dump(d)
			}
			function _error(x,t,m){
				
			}
			vp.resources.getResource("/query/"+_o.type+"/"+_o.query,{},_success,_error)
		}
		
		_initialize()
		return vpq
	}
})(vp);