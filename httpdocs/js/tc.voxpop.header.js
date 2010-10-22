/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.jQ.fn.header = function(options){
		var $vph = this, _o = {}, _section_nav = null;
		
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Header Starting",'info')
			_setup_events()
			_section_nav = $vph.find('#section_nav').section_nav(_o)
			return $vph
		}
		
		function _setup_events(){

		}
		
		function _open(){
			
		}
		
		function _close(){
			
		}
		
		return _initialize()
	}
})(vp);