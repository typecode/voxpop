/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.data['names'] = {}
	
	vp.jQ.fn.voxpop = function(options){
		var $vp, _o, _queries = [], _search, _display, _sections = {}, _filterStack = [], _idleTimer = null;
		
		$vp = this
		_o = vp.jQ.extend({
			idleTimeout:120000
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop User Interface Starting",'info')
			_setup_global_events()
			
			_o.environmentSupport = _checkEnvironmentSupport()
			
			_header = $vp.find('#header').header(_o)
			_display = $vp.find('#display').display(_o)
			_filterPanel = $vp.find('#details').filter_panel(_o)
			_filterPanel.close()
			_sections['about'] = new vp.fn.aboutmodal(_o)
			_display.append(_sections['about'].close(false).getDisplay())
			if(window.location.hash == "" || window.location.hash == "#about"){
				window.location.hash = "#about"
				_openCurrentSection()
			}
			
			if(_o.environmentSupport){
				
				if(_o.exhibition){
					_setupIdleTimeout()
				}
				
				_get_names(function(){
					_sections['search'] = new vp.fn.search(_o)
					_sections['universe'] = new vp.fn.universe(_o)
					_sections['dashboard'] = new vp.fn.dashboard(_o)
					_sections['map'] = new vp.fn.map(_o)
					_sections['timeline'] = new vp.fn.timeline(_o)
					_sections['readmodal'] = new vp.fn.readmodal(_o)
					_display.append(_sections['readmodal'].close(false).getDisplay())
					_filterStack = _getCurrentFilterStack()
					vp.events.trigger('filterStackModified',{filterStack:_filterStack})
					if(window.location.hash != "#about"){
						_openCurrentSection()
					}
				})
			}
		}
		
		function _checkEnvironmentSupport(){
			vp.util.dump(vp.jQ.browser)
			vp.util.dump(vp.jQ.support)
			return true
		}
		
		function _setupIdleTimeout(){
			vp.jQ(window).bind('mousemove',_windowMouseMoveEventHandler)
		}
		
		function _windowMouseMoveEventHandler(){
			if(_idleTimer){
				vp.jQ.clearTimer(_idleTimer)
			}
			_idleTimer = vp.jQ.timer(_o.idleTimeout,_idleTimeout)
		}
		
		function _idleTimeout(){
			window.location.hash = "#universe"
			_openCurrentSection()
		}
		
		function _test_connection(cb){
			var __tries = 0
			function callback(d, ts){
				if(d == null){
					_test_connection(cb)
				} else {
					vp.console.printToConsole("VoxPop Server Connected Version "+d.voxpop)
					if(typeof cb == 'function'){
						cb()
					}
				}
			}
			function errorCallback(xhr, ts, ec){
				vp.util.log("Cannot Connect To VoxPop Server",'error')
			}
			__connect()
			function __connect(){
				vp.resources.getResource("/", {}, callback, errorCallback)
				__tries++
			}
		}
		
		function _get_names(cb){
			function callback(d,ts){
				vp.data.names = d.names
				//vp.console.printToConsole("VoxPop Server Connected Version "+d.voxpop)
				if(typeof cb == 'function'){
					cb()
				}
			}
			function errorCallback(xhr, ts, ec){
				vp.util.log("Cannot Fetch The Voxpop Name Lookup",'error')
			}
			vp.resources.getResource("/voxpop/namelookup", {}, callback, errorCallback)
		}
		
		function _setup_global_events(){
			vp.jQ(window).bind('resize',_windowResizeEventHandler)
			vp.events.bind("searchSubmitted",_searchSubmittedHandler)
			vp.events.bind("filterKeyAdded",_filterKeyAddedEventHandler)
			vp.events.bind("filterKeyRemoved",_filterKeyRemovedEventHandler)
			vp.events.bind("openReadmodal",_openReadmodalEventHandler)
			vp.jQ('a[target=voxpop]').live('click',_voxpopLinkClickHandler)
			vp.jQ(document).bind('keypress',_keypressHandler)
			vp.util.log("VoxPop Global Events Initialized",'info')
		}
		
		function _windowResizeEventHandler(){
			vp.events.trigger('windowResize')
		}
		
		function _searchSubmittedHandler(e,d){
			var _newQuery = vp.fn.query(d)
			if(_newQuery != false){
				_queries.push(_newQuery)
			}
		}
		
		function _filterKeyAddedEventHandler(e,d){
			_filterStack.push(d.key)
			if(_getCurrentSection() == 'universe'){
				window.location.hash = '#map,'
			} else {
				window.location.hash = '#'+_getCurrentSection()+','
			}
			for(var i in _filterStack){
				window.location.hash += _filterStack[i]
				if(i < _filterStack.length-1){
					window.location.hash += ','
				}
			}
			_openCurrentSection()
		}
		
		function _filterKeyRemovedEventHandler(e,d){
			var _keyIndex = _filterStack.indexOf(d.key)
			if(_keyIndex != -1){
				_filterStack.splice(_keyIndex,1)
			}
			window.location.hash = '#'+_getCurrentSection()+','
			for(var i in _filterStack){
				window.location.hash += _filterStack[i]
				if(i < _filterStack.length-1){
					window.location.hash += ','
				}
			}
			_openCurrentSection()
		}
		
		function _openReadmodalEventHandler(e,d){
			vp.util.dump('_openReadmodalEventHandler')
			_sections['readmodal'].open()
		}
		
		function _keypressHandler(e){
			if(e.which == 96){
				window.location.hash = "#universe"
				_openCurrentSection()
			}
		}
		
		function _getCurrentSection(){
			if(window.location.hash.indexOf(",") != -1){
				return window.location.hash.substring(window.location.hash.indexOf("#")+1,window.location.hash.indexOf(","))
			} else {
				return window.location.hash.substring(window.location.hash.indexOf("#")+1,window.location.hash.length)
			}
		}
		
		function _getCurrentFilterStack(){
			if(window.location.hash.indexOf(",") != -1){
				return window.location.hash.substring(window.location.hash.indexOf(",")+1,window.location.hash.length).split(',')
			} else {
				return null
			}
		}
		
		function _openCurrentSection(){
			var _section = _getCurrentSection()
			var _filter = _getCurrentFilterStack()
			if(!_section){
				_section = 'about'
			}
			if(_section == 'universe'){
				_filterStack = []
				_filter = []
			}
			var _data = {id:_filter}
			vp.events.trigger('sectionOpened',{sectionName:_section,filterStack:_filter})
			if(typeof _sections[_section] != 'undefined'){
				if(typeof _sections[_section] == 'function'){
					var _mySection = _sections[_section]({})
					if(_mySection != false){
						_display.show(_section, _mySection, _data)
					}
				} else {
					_display.show(_section, _sections[_section], _data)
				}
			}
		}
		
		function _voxpopLinkClickHandler(e){
			e.preventDefault()
			var _t = null
			if(e.target.nodeName == 'A'){
				_t = e.target
			} else {
				_t = e.target.parentNode
			}
			window.location.hash = _t.hash
			_openCurrentSection()
		}
		
		_initialize()
		return $vp
	}
})(vp);