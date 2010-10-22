/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  Copyright 2009 WealthOne, Inc.  ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	vp.jQ.fn.output = function(options){
		var o, $c, initialized, _consoleReady, _consoleBuffer, _hideTimer
		
		$c = this
		initialized = false
		o = jQuery.extend({
			hide_delay:500,
			overlay:50,
			modal:false
		},options);
		
		function initialize(){
			_initialize_modal()
			_setup_events()
			vp.util.log("Modal Initialized")
			initialized = true
			_consoleReady = false
			_consoleOpening = false
			_consoleBuffer = ""
			_hideTimer = null
		}
		
		function _initialize_modal(){
			$c.jqm({overlay:o.overlay,modal:o.modal, onShow:_openConsole, onHide:_closeConsole})
		}
		
		function _openConsole(){
			$c.css('opacity',0).show().animate({opacity:1},300,function(){
				
			})
		}
		
		function _closeConsole(){
			$c.animate({opacity:0},300,function(){
				$c.html("")
				$c.hide()
			})
		}
		
		$c.showConsole = function(_cancel){
			_consoleOpening = true
			if(typeof _cancel == 'function'){
				function __cancelButtonClickHandler(e){
					e.preventDefault()
					_cancel()
					$c.hideConsole(50)
				}
				$c.append("<p class='buttons'><a href='#' class='button cancel' id='consoleCancelButton' target=''><span>Cancel</span></a><div class='clear'></div>").find('#consoleCancelButton').unbind('click').bind('click',__cancelButtonClickHandler)
			}
			if($c.children(".console").length == 0){
				$c.append("<div class='console'></div>")
			}
			
			_consoleReady = true
			$c.children(".console").append(_consoleBuffer)
			_consoleBuffer = ""
			$c.jqmShow()
			_consoleOpening = false
			if(o.hide_delay){
				_hideTimer = vp.jQ.timer(o.hide_delay,_hideConsole)
			}
		}
		
		$c.printToConsole = function(str,level){
			var _class = "";
			if(level != null){
				_class = level
			}
			if(!_consoleReady && _consoleOpening){
				_consoleBuffer = _consoleBuffer+"<p class='"+_class+"'>"+str+"</p>"
			} if(!_consoleReady){
				_consoleBuffer = _consoleBuffer+"<p class='"+_class+"'>"+str+"</p>"
				$c.showConsole()
			} else {
				$c.children('.console').append("<p class='"+_class+"'>"+str+"</p>")
			}
			if(o.hide_delay){
				jQuery.clearTimer(_hideTimer)
				_hideTimer = vp.jQ.timer(o.hide_delay,_hideConsole)
			}
		}
		
		$c.showAnimatedLoader = function(){
			$c.children('.console').append("<p class='loader'><img src='gs/loader_sm_161616.gif'></img></p>")
		}
		
		$c.clearConsole = function(){
			$c.children('.console').children().remove()
		}
		
		function _hideConsole(delay){
			if(delay != null){
				vp.jQ.timer(delay,__continue)
			} else {
				__continue()
			}
			function __continue(){
				$c.closeModal()
				_consoleReady = false
				if(_hideTimer != null){
					jQuery.clearTimer(_hideTimer)
					_hideTimer = null
				}
			}
			
		}
		
		$c.hideConsole = function(delay){
			_hideConsole()
		}
		
		$c.showModal = function(){
			$c.jqmShow()
		}
		
		$c.closeModal = function(){
			$c.jqmHide()
		}
		
		function _setup_events(){
			
		}
		
		initialize()
		return $c
	}
})(vp);