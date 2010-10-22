/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.fn.beanstalkd = function(options){
		var vpbs, _o, _tubes
		
		vpbs = this
		_o = vp.jQ.extend({
			refresh_rate:60000
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Beanstalkd Monitor Initializing")
			_tubes = {}
			_update()
		}
		
		function _update(){
			function _success(d,ts){
				vp.events.trigger("beanstalkdUpdated",d)
				vp.jQ.timer(_o.refresh_rate,_update)
			}
			function _error(x,t,m){
			}
			vp.resources.getResource("/status/beanstalkd/",{},_success,_error)
		}
		
		_initialize()
		return vpbs
	}
})(vp);