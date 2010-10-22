/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config['dashboard'] = {}
	vp.config.dashboard['wrapper'] = vp.jQ('<div id="dashboard"></div>')
	vp.config.dashboard['loader'] = vp.jQ('<div class="loader"><img src="gs/loader_sm.gif"></img></div>')
		
	vp.fn.dashboard = function(options){
		var vpdb, _o, _myDisplay, _left_col, _content
		
		vpdb = this
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Dashboard Initializing")
			_left_col = new vp.fn.dashboardLeftCol(_o)
			_content = new vp.fn.dashboardContent(_o)
			return vpdb
		}
		
		function _buildDisplay(){
			_myDisplay = vp.config.dashboard.wrapper.clone()
			_myDisplay.append(_left_col.getDisplay())
			_myDisplay.append(_content.getDisplay())
		}
		
		vpdb.getDisplay = function(){
			if(!_myDisplay){
				_buildDisplay()
			}
			return _myDisplay
		}
		
		vpdb.update = function(id){
			vp.util.log('vpdb.update','info')
			if(!_myDisplay){
				_buildDisplay()
			}
			if(id){
				//vp.util.log(id,'info')
			}
		}
		
		return _initialize()
	}
})(vp);