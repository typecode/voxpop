import logging, os, pickle, sys
import voxpop
from controllers.controller import *
import nytTags
import nyt.nytArticle
import nyt.nytCommunity
import vp.vpStats

class Stats(Controller):
	
	def GET(self,_1=None,_2=None):
		logging.info("#### Stats")
		if _1 == 'run' and _2 == "all":
			return self.run_stats_on_all_caches_workers()
		return self.json_not_found()
				
	def run_stats_on_all_caches_workers(self):
		logging.critical("##### Stats.run_stats_on_all_caches_workers")
		with voxpop.VPE.db_lock:
			list = json.loads(voxpop.VPE.get_db().open_document('_design/caches/_view/list',group='true'))['rows']
		if list is not None:
			for i in list:
				request = {}
				request['item_id'] = i[u'key']
				request['functions'] = [vpStats.run_stats_on_item]
				#logging.critical('BSM[STATS] Size:'+str(sys.getsizeof(pickle.dumps(request))))
				with voxpop.VPE.beanstalkd_lock:
					voxpop.VPE.get_beanstalkd().use("stats")
					voxpop.VPE.get_beanstalkd().put(pickle.dumps(request), pri=100000)