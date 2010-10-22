/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.fn.resources = function(options){
		var o, r, initialized, htmlRequest
		
		initialized = false
		r = this
		o = jQuery.extend({
			timeout:300000
		},options)
		
		function initialize(){
			vp.jQ.ajaxSetup({
				cache:false,
				timeout:o.timeout,
			})
			htmlRequest = null
			vp.util.log("VoxPop Resources Initialized")
			initialized = true
		}
		
		r.getResource = function(URI, data, callback, errorCallback){
			var opts = 	{
							type:'GET',
							data: data,
							dataType:'json',
							success:callback,
							url: '/vp'+URI
						}
			if(typeof errorCallback == "function"){
				opts.error = errorCallback
			}
			return vp.jQ.ajax(opts)
		}
		
		r.postResource = function(URI, data, callback, errorCallback){
			var opts = 	{
							type:'POST',
							data: vp.json.stringify(data),
							dataType:'text',
							contentType:'application/json',
							success:callback,
							url: '/vp'+URI
						}
			if(typeof errorCallback == "function"){
				opts.error = errorCallback
			}
			return vp.jQ.ajax(opts)
		}
		
		r.deleteResource = function(URI, callback, errorCallback){
			var opts = 	{
							type:'DELETE',
							data: "",
							dataType:'text',
							contentType:'application/json',
							success:callback,
							url: '/vp'+URI
						}
			if(typeof errorCallback == "function"){
				opts.error = errorCallback
			}
			return vp.jQ.ajax(opts)
		}
		
		initialize()
		return r
	}
})(vp);