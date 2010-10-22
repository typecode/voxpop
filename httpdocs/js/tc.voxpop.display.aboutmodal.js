/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	vp.config['aboutmodal'] = {}
	vp.config.aboutmodal['base'] = vp.jQ('<div class="aboutModal"><div class="rmOverlay"></div><div class="amContent"></div></div>')
	vp.config.aboutmodal['noSupport'] = vp.jQ('<div class="noSupport"><img src="gs/ns_placeHolder.png" alt="" width="899" height="288" /></div>')
	
	vp.config.aboutmodal['amContent'] = {}
	vp.config.aboutmodal.amContent['base'] = vp.jQ('<div class="amLeadContent"></div>')
	vp.config.aboutmodal.amContent['noSupport'] =  vp.jQ('<div class="noSupport">'+
												'<img src="gs/ns_placeHolder.png" alt="" width="899" height="288" />'+
												'</div>')
	vp.config.aboutmodal.amContent['video'] = vp.jQ('<div class="amVideo"><div id="intro_video"></div></div>')
	vp.config.aboutmodal.amContent['leadCopy'] = vp.jQ('<div class="amLeadCopy">'+
						'<h1>What is VoxPop?</h1>'+
						'<p>VoxPop enables the visual exploration of sentiment contained in reader comments on the New York Times website.</p>'+
						'<p>By siphoning reader comments from the New York Times API through a custom Natural Language Processing tool-chain, VoxPop classifies <span class="pos">positively</span> and <span class="neg">negatively</span> charged words.</p>'+
						'<p>Reader sentiment is abstracted across thousands of comments in trending topics of conversation, and visualized through time and space.</p>'+
					'</div>')
	vp.config.aboutmodal.amContent['subNav'] = vp.jQ('<ul class="amSubNav">'+
						'<li><a rel="amSubExtended" href="#">More Details</a></li>'+
						'<li><a rel="amSubTeam" href="#">About the Team</a></li>'+
						'<li><a rel="amSubThanks" href="#">Special Thanks</a></li>'+
						'<li><a rel="external" class="extLink" href="http://voxpop.tc" target="_blank">Project Blog</a></li>'+
					'</ul>')
	vp.config.aboutmodal.amContent['startButton'] = vp.jQ('<a class="amStartButton" target="voxpop" href="#universe">Start Exploring</a> </div>')
	
	vp.config.aboutmodal['sub'] = {}
	vp.config.aboutmodal.sub['base'] = vp.jQ('<div class="amSub"></div>')
	vp.config.aboutmodal.sub['team'] = {}
	vp.config.aboutmodal.sub.team['base'] = vp.jQ('<div class="amSubTeam"></div>')
	vp.config.aboutmodal.sub.team['zeke'] = vp.jQ('<div class="amTeamItem">'+
							'<div class="amTeamImageZeke"></div>'+
							'<div class="amTeamBio">'+
								'<h2>Zeke Shore</h2>'+
								'<p>A recent graduate of <a href="http://newschool.edu/parsons/" target="_blank">Parsons School of Design</a> and co-founder of the design studio <a href="http://blog.typeslashcode.com" target="_blank">Type/Code</a>, Zeke has been consulting on user experience design and user interface design for over seven years, working on projects ranging from consumer web start-ups to international consulting firms, to enterprise web solutions for the financial advising industry.</p>'+
								'<p>After recently finishing a gig as a user experience designer at Google, he has been inspired by goal of organizing the worlds information and making it accessible. This has lead to exploring the web as a tool for evolving human discourse. More information about Zeke can be found at <a href="http://zekeshore.com" target="_blank">zekeshore.com</a>, and he can be reached directly at zeke@zekeshore.com.</p>'+
							'</div>'+
							'<div class="clear"></div>'+
						'</div>')
	vp.config.aboutmodal.sub.team['andrew'] = vp.jQ('<div class="amTeamItem">'+
							'<div class="amTeamImageAndy"></div>'+
							'<div class="amTeamBio">'+
								'<h2>Andrew Mahon</h2>'+
								'<p>A <a href="http://newschool.edu/parsons/" target="_blank">Parsons</a> graduate and <a href="http://blog.typeslashcode.com" target="_blank">Type/Code</a> co-founder, Andrew is an experienced front-end designer and developer, with a passion for web and mobile technologies. Andrew recently worked on a project for the National 911 Memorial and Museum with the firm Local Projects. </p>'+
								'<p>Andrew has extensive experience working for non-profits in the public realm, polishing his teeth with a multi-year internship at Eyebeam Atelier. Andrew’s project for the National 911 Memorial Museum exhibits his capability and experience developing large scale, high profile projects for the public realm – as evidenced by Mayor Bloomberg’s presentation of the project in September of 2009. More information about Andrew can be found at <a href="http://andrewmahon.info" target="_blank">andrewmahon.info</a>, and he can be reached directly at amahon@gmail.com.</p>'+
							'</div>'+
							'<div class="clear"></div>'+
						'</div>')
	
	vp.config.aboutmodal.sub['thanks'] = {}
	vp.config.aboutmodal.sub.thanks['base'] = vp.jQ('<div class="amSubThanks"> </div>')
	vp.config.aboutmodal.sub.thanks['logos'] = vp.jQ('<div class="amThanksLogos">'+
		'<a class="amThanksImage" href="http://www.newschool.edu/parsons/" target="_blank"><img src="gs/thanks_01.png" width="212" height="15" alt="Parsons" title="Parsons" /></a>'+
		'<a class="amThanksImage" href="http://developer.nytimes.com/" target="_blank"><img src="gs/thanks_03.png" width="212" height="30" alt="New York Times API" title="New York Times API"/></a>'+
		'<a class="amThanksImage" href="http://couchdb.apache.org/" target="_blank"><img src="gs/thanks_05.png" width="53" height="34" alt="CouchDB" title="CouchDB"/></a>'+
		'<a class="amThanksImage" href="http://www.python.org/" target="_blank"><img src="gs/thanks_06.png" width="118" height="34" alt="Python" title="Python"/></a>'+
		'<a class="amThanksImage" href="http://www.cloudmade.com/" target="_blank"><img src="gs/thanks_07.png" width="41" height="34" alt="Cloudmade" title="Cloudmade"/></a>'+
		'<a class="amThanksImage" href="http://www.highcharts.com/" target="_blank"><img src="gs/thanks_09.png" width="212" height="40" alt="Highcharts" title="Highcharts" /></a>'+
		'<a class="amThanksImage" href="http://code.google.com/apis/maps/" target="_blank"><img src="gs/thanks_11.png" width="90" height="33" alt="Google Map API" title="Google Maps API" /></a>'+
		'<a class="amThanksImage" href="http://memcached.org/" target="_blank"><img src="gs/thanks_12.png" width="60" height="33" alt="Memcached" title="Memcached" /></a>'+
		'<a class="amThanksImage" href="http://www.w3.org/" target="_blank"><img src="gs/thanks_13.png" width="60" height="33" alt="W3C" title="W3C" /></a>'+
	'</div>')
	vp.config.aboutmodal.sub.thanks['copy'] = vp.jQ('<div class="amThanksCopy">'+
							'<h2>People</h2>'+
							'<p>VoxPop would not have been possible without the support of many individuals throughout the duration of the project. Our thesis advisors at Parsons School of Design, Dave Carroll and Anthony Deen, helped see us through the conception of the idea, months of research and prototyping, and the design and development of the final web application. Additional guidance from Parsons faculty Julia Wargaski and Ted Byfield was invaluable. Many thanks to Derek Gottfrid and New York Times R&D department for support and enthusiasm. And of course thanks to our friends and peers, for all the feedback and critiques.</p>'+
							'<h2>Institutions</h2>'+
							'<p>Parsons The New School for Design, The New York Times R&D department, MIT and Harvard for hosting and maintaining the General Inquirer Dictionary.</p>'+
							'<h2>Open Source</h2>'+
							'<p>A significant portion of VoxPop is built around open source software, public APIs, and open standards development paradigms. The New York Times APIs provided a perfect launch point for exploring discourse surrounding journalism. At its core, VoxPop leverages Python, and the Natural Language Toolkit, with other open source server side solutions including CouchDB, Memchached, Ubuntu, and the Google Maps Geocoder. On the front end, VoxPop is using CloudMade and Highcharts, with the rest of the interface built with HTML5 and CSS3.</p>'+
						'<p>To maintain parity with all of the open source tools that have made VoxPop possible, this project is available on Google Code for others to explore and iterate on. VoxPop is available under a GNU General Public License v3 and Creative Commons 3.0 BY-SA </p>'+
						'</div>'+
						'<div class="clear"></div>')
	
						
	
	vp.config.aboutmodal.sub['extendedAbout'] = {}
	vp.config.aboutmodal.sub.extendedAbout['base'] = vp.jQ('<div class="amSubExtended"></div>')
	vp.config.aboutmodal.sub.extendedAbout['copy'] = vp.jQ('<div class="amThanksLogos"> <img src="gs/about_thumb_1.jpg" width="212" height="212" alt="VoxPop Timeline" /><br/><br/><br/><img src="gs/about_thumb_2.jpg" alt="" width="212" height="212" /></div>'+
					'<div class="amThanksCopy">'+
						'<h2>About The Project</h2>'+
						'<p>As public discourse surrounding journalism moves online, conversations begin to scale rapidly. When a single article on the New York Times website inspires thousands of comments, it becomes impossible to reveal the collective voice contained within. VoxPop is a tool for abstracting online discourse, and visualizing sentiment through time and space.</p>'+
						'<p>In the 1950&#39;s, Psychologist Charles Osgood developed the semantic differential theory, proposing a technique to measure the connotative meaning of concepts by placing them on a scale between bipolar adjective-pairs. After further research, Osgood discovered the evaluative scale, measuring words between &#145;positive&#146; and &#145;negative,&#146; as a dominant metric in classifying the meaning of words.</p>'+
						'<p>Over the past few decades, psychologists and communication theorists including George A. Miller and Harold Lasswell developed databases that map words against Osgood&#39;s dominant adjective-pairs. These efforts include the General Inquirer Dictionary, maintained by Harvard and MIT, and kept open for academic research, allowing it to form the core of VoxPop&#39;s sentiment analysis engine.</p>'+
						'<p>The New York Times has recently made their content available to developers allowing VoxPop to siphon reader comments through a custom Natural Language Processing tool-chain. The VoxPop engine leverages decades worth of research and couples it with new technology to explore sentiment on a large scale. VoxPop processes hundreds of thousands of comments, identifying positively and negatively charged words to aggregate and visualize the collective sentiment.</p>'+
						'<p>The VoxPop web application enables the visual exploration of reader sentiment on the New York Times, mapping conversations geographically and chronologically, and visualizing the use of positive and negative words. To maintain parity with the open ideals that make a wealth of data and toolkits available, VoxPop is built with open standard technologies such as HTML5 and Javascript. Additionally, VoxPop has been released as open source, encouraging others to continue development.</p>'+
					'</div>'+
					'<div class="clear"></div>')
	
	
	vp.fn.aboutmodal = function(options){
		var am = this, _o = {}, _myDisplay = null, _video = null;
		
		_o = vp.jQ.extend({
			
		},options)
		
		function _initialize(){
			vp.util.log("VoxPop Aboutmodal Initializing")
			_buildDisplay()
			_setup_events()
			return am
		}
		
		function _setup_events(){
			vp.events.bind('sectionOpened',_sectionOpenedHandler)
			_myDisplay.find('.amSubNav').find('a').bind('click',_subNavClickHandler)
			//_myDisplay.find('.amStartButton').bind('click',_amStartButtonClickHandler)
		}
		
		function _buildDisplay(){
			_myDisplay = vp.config.aboutmodal.base.clone()
			var _myContent = vp.config.aboutmodal.amContent.base.clone()
			
			if(!_o.environmentSupport){
				vp.config.aboutmodal.amContent.noSupport.clone().appendTo(_myDisplay.children('.amContent'))
			}
			
			_myContent.append(vp.config.aboutmodal.amContent.video.clone())
			_myContent.append(vp.config.aboutmodal.amContent.leadCopy.clone())
			_myContent.append(vp.config.aboutmodal.amContent.subNav.clone())
			if(_o.exhibition){
				_myContent.find('a.extLink').parent().remove()
			}
			
			if(_o.environmentSupport){
				_myContent.append(vp.config.aboutmodal.amContent.startButton.clone())
			}
			
			_myContent.appendTo(_myDisplay.children('.amContent'))
			
			var _sub = vp.config.aboutmodal.sub.base.clone()
			
			var _subAbout = vp.config.aboutmodal.sub.team.base.clone()
			var _random = Math.random()
			if(_random < 0.6){
				_subAbout.append(vp.config.aboutmodal.sub.team.andrew.clone())
				_subAbout.append(vp.config.aboutmodal.sub.team.zeke.clone())
			} else {
				_subAbout.append(vp.config.aboutmodal.sub.team.zeke.clone())
				_subAbout.append(vp.config.aboutmodal.sub.team.andrew.clone())
			}
			_subAbout.appendTo(_sub).hide()
			
			var _subThanks = vp.config.aboutmodal.sub.thanks.base.clone()
			_subThanks.append(vp.config.aboutmodal.sub.thanks.logos.clone())
			_subThanks.append(vp.config.aboutmodal.sub.thanks.copy.clone())
			
			_subThanks.appendTo(_sub).hide()
			
			var _subExtended = vp.config.aboutmodal.sub.extendedAbout.base.clone()
			_subExtended.append(vp.config.aboutmodal.sub.extendedAbout.copy.clone())
			_subExtended.appendTo(_sub).hide()
			
			if(_o.exhibition){
				_sub.find('a[target=_blank]').bind('click',function(e){ e.preventDefault(); })
			}
			
			_sub.appendTo(_myDisplay.children('.amContent'))
		}
		
		function _initVideo(){
			if(!_video){
				_video = new SWFObject('assets/player.swf','mpl','460','305','9');
				_video.addParam('allowfullscreen','false');
				_video.addParam('allowscriptaccess','always');
				_video.addParam('wmode','opaque');
				_video.addVariable('file','http://voxpoptc.s3.amazonaws.com/intro_v1.mp4');
				_video.addVariable('image','gs/vp_thumb_2.jpg');
				_video.addVariable('frontcolor','323232');
				_video.addVariable('lightcolor','cc9900');
				_video.addVariable('screencolor','323232');
				_video.addVariable('skin','assets/beelden.zip');
				_video.addVariable('controlbar','over');
				_video.addVariable('icons','false');
				_video.write('intro_video');
			}
		}
		
		function _sectionOpenedHandler(e,d){
			if(d.sectionName && d.sectionName != 'about'){
				var _startHref = '#'
				_startHref += d.sectionName
				if(d.filterStack && d.filterStack.length){
				_startHref = '#' + d.sectionName + ','
					for(var i in d.filterStack){
						_startHref += d.filterStack[i]
						if(i < d.filterStack.length-1){
							_startHref += ','
						}
					}
				}
				_myDisplay.find('.amStartButton').attr('href',_startHref).text('Keep Exploring')
			}
		}
		
		function _subNavClickHandler(e){
			if(e.target.rel != 'external'){
				e.preventDefault()
				var _a = vp.jQ(e.target)
				if(_a.hasClass('active')){
					_a.removeClass('active')
					_myDisplay.find('.amSub').children('.'+e.target.rel).hide().parent().stop().animate({'height':'0px'},1000,function(){})
					
				} else {
					_a.addClass('active').parent().siblings().children('a').removeClass('active')
					_myDisplay.find('.amSub').css('height',_myDisplay.find('.amSub').height()).children('.'+e.target.rel).show().siblings().hide()
					var _targetHeight = 0
					_myDisplay.find('.amSub').children(':visible').each(function(i,j){
						_targetHeight += vp.jQ(j).outerHeight()
					})
					_myDisplay.find('.amSub').stop().animate({'height':_targetHeight+'px'},1000)
				}
			}
		}
		
		function _amStartButtonClickHandler(){
			
		}
		
		am.open = function(animate){
			_open(animate)
			return am
		}
		
		function _open(animate){
			vp.util.dump('aboutmodal._open')
			vp.events.trigger('aboutmodalOpening',{})
			vp.jQ(document).bind('keypress',_keypressHandler)
			if(animate){
				_myDisplay.show().css('opacity',1.0)
			} else {
				_myDisplay.show().css('opacity',1.0)
			}
		}
		
		am.close = function(animate){
			_close(animate)
			return am
		}
		
		function _close(animate){
			vp.util.dump('aboutmodal._close')
			vp.events.trigger('aboutmodalClosing',{})
			vp.jQ(document).unbind('keypress',_keypressHandler)
			if(animate){
				_myDisplay.hide()
			} else {
				_myDisplay.hide()
			}
		}
		
		function _keypressHandler(e){
			if(e.which == 0){ // 'esc' close
				e.stopPropagation()
				e.preventDefault()
				_myDisplay.find('.amStartButton').trigger('click')
			}
		}
		
		am.getDisplay = function(){
			return _myDisplay
		}
		
		am.update = function(data){
			vp.jQ('body').css('overflowY','auto')
			vp.jQ(document).bind('keypress',_keypressHandler)
			_initVideo()
		}
		
		am.pause = function(data){
			vp.jQ(document).unbind('keypress',_keypressHandler)
		}
		
		return _initialize()
	}
})(vp);