/******************************************/
/******************************************/
/****  JS Document                     ****/
/****  VoxPop 2010                     ****/
/****  by Andrew Mahon                 ****/
/******************************************/
/******************************************/

(function(vp) {
	
	if(!vp.config.timeline){
		vp.config['timeline'] = {}
	}
	
	vp.config.timeline['highcharts'] = {
		chart:{
			renderTo:'chart',
			margin:[53, 0, 25, 245],
			zoomType:''
		},
		title:{
			text:''
		},
		tooltip:{
			enabled:false,
			snap:50
		},
		legend:{
			enabled:false
		},
		xAxis:{
			type:'datetime',
			dateTimeLabelFormats:{
				second: '%l:%M%P on %e/%m/%y',
				minute: '%l:%M%P on %e/%m/%y',
				hour: '%l:%M%P on %e/%m/%y',
				day: '%e/%m/%y',
				week: '%e/%m/%y',
				month: '%e/%m/%y',
				year: '%e/%m/%y',
			},
			tickPixelInterval:200,
			gridLineWidth:1,
			gridLineColor:'#333333',
			showFirstLabel:false//,
			//maxZoom:3600000
		},
		yAxis:{
			tickInterval:0.5,
			min:-0.025,
			max:1.025,
			endOnTick:false,
			startOnTick:false,
			gridLineColor:'#464646',
			labels:{
				enabled:false
			},
			title:{
				enabled:false
			}
		},
		plotOptions:{
			scatter:{
				animation:false,
				marker:{
					symbol:'circle',
					states:{
						hover:{
							enabled:true,
							fillColor:'white',
							lineWidth:2
						}
					}
				},
				point:{
					events:{
						click:function(event){
							vp.events.trigger('openReadmodalForKeys',vp.json.parse(this.options.name))
						}
					}
				}
			},
			line:{
				color:'#727171',
				shadow:false,
				enableMouseTracking:false,
				marker:{
					enabled:false
				}
			},
			column:{
				pointWidth:5,
				borderWidth:0,
				color:'rgba(255,255,255,0.1)',
				dataLabels:{
					formatter: function() {
						return vp.json.parse(this.point.name)['title'];
					},
					enabled:true,
					rotation:270,
					align:'right',
					x:-5,
					y:5,
					color:'rgba(255,255,255,0.5)'
				},
				point:{
					events:{
						click:function(event){
							vp.util.dump(this.options.name)
							vp.events.trigger('openReadmodalForArticleId',vp.json.parse(this.options.name))
						}
					},
					states:{
						hover:{
							enabled:true
						}
					}
				}
				
			},
			series:{
				enableMouseTracking:true,
				allowPointSelect: false,
				cursor:'pointer',
				dataLabels:{
					color:'rgba(255,255,255,0.5)'
				},
				marker:{
					states:{
						hover:{
							enabled:true
						}
					}
				}
			}
		},
		series:[
			{
				data:[],
				name:'Smoothed',
				type:'line',
				enableMouseTracking:false
			},
			{
				data:[],
				name:'Comments',
				type:'scatter',
				enableMouseTracking:true
			},
			{
				data:[],
				name:'Articles',
				type:'column',
				enableMouseTracking:false
			}
		]
	}
})(vp);