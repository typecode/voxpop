/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2009                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	var log = true
	vp.util.log = function(message,level){
		if(log){
			if (typeof console != "undefined" && typeof console.debug != "undefined") {
				if(!level){
					console.info(message)
				} else {
					console[level](message)
				}
			}
		}
	}
	vp.util.dump = function(object){
		if(log){
			if (typeof console != "undefined" && typeof console.debug != "undefined") {
				console.log(object)
			}
		}
	}
	vp.util.round = function(Number,DecimalPlaces){
		return Math.round(parseFloat(Number) * Math.pow(10, DecimalPlaces)) / Math.pow(10, DecimalPlaces);
	}
	vp.util.roundFixed = function(Number,DecimalPlaces){
		return vp.util.round(Number, DecimalPlaces).toFixed(DecimalPlaces);
	}
	vp.util.getTime = function(){
		return new Date().valueOf()
	}
	vp.util.getRandomStr = function(length){
		var str = String(new Date().getTime()).replace(/\D/gi,'')
		if(length){
			str = str.substring(0,length*1.0)
		}
		return str
	}
	vp.util.rand = function(l,u){
	    return Math.floor((Math.random() * (u-l+1))+l);
	}
	vp.util.colorFade = function(h1, h2, p) { 
		return ((h1>>16)+((h2>>16)-(h1>>16))*p)<<16|(h1>>8&0xFF)+((h2>>8&0xFF)-(h1>>8&0xFF))*p<<8|(h1&0xFF)+((h2&0xFF)-(h1&0xFF))*p; 
	}
	vp.util.fadeColorsForRatio = function(ratio,h0,h1,h2){
		if(ratio >= 0.5){
			var _myRatio = (ratio - 0.5) * 2
			return vp.util.colorFade('0x'+h1,'0x'+h2,_myRatio).toString(16)
		} else {
			var _myRatio = 1.0 - ((0.5 - ratio) * 2)
			return vp.util.colorFade('0x'+h0,'0x'+h1,_myRatio).toString(16)
		}
	}
	vp.util.getRGBFromHex = function(index,hex){
		if(index.toLowerCase() == "r"){
			return parseInt((vp.util.cutHex(hex)).substring(0,2),16)
		} else if(index.toLowerCase() == "g"){
			return parseInt((vp.util.cutHex(hex)).substring(2,4),16)
		} else if(index.toLowerCase() == "b"){
			return parseInt((vp.util.cutHex(hex)).substring(4,6),16)
		}
	}
	vp.util.cutHex = function(h){
		return (h.charAt(0)=="#") ? h.substring(1,7):h
	}
	vp.util.flush = function(object){
		if (typeof object != "undefined") {
			delete object
		}
	}
})(vp);