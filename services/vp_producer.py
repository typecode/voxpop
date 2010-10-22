#!/usr/bin/env python

import logging
import voxpop as voxpop
import config
import itemManager, item
import vp_workers
from lib import web
from lib import couch
from lib import yaml
import lib.memcache.memcache as memcache
from lib.beanstalk import serverconn

ROUTES = (
	r'/stats/?([^/.]*)/?([^/.]*)', 'controllers.stats.Stats',
	r'/status/?([^/.]*)/?([^/.]*)', 'controllers.status.Status',
	r'/timeline/?([^/.]*)/?([^/.]*)', 'controllers.timeline.Timeline',
	r'/readmodal/?([^/.]*)/?([^/.]*)', 'controllers.readmodal.Readmodal',
	r'/map/?([^/.]*)/?([^/.]*)', 'controllers.map.Map',
	r'/universe/?([^/.]*)/?([^/.]*)', 'controllers.universe.Universe',
	r'/dashboard/?([^/.]*)/?([^/.]*)', 'controllers.dashboard.Dashboard',
	r'/query/?([^/.]*)/?([^/.]*)', 'controllers.query.Query',
	r'/voxpop/?([^/.]*)/?([^/.]*)', 'controllers.main.Main',
	r'/?([^/.]*)', 'controllers.main.Main'
)

class VoxPopProducer():
	cache_worker = 'producer0'
	
	def start(self):
		logging.info('---> Logger Initialized')
		logging.critical("---> VoxPop Producer started!")
		web.debug = True
		app = web.application(ROUTES, globals(), True)
		logging.critical("---> DB: "+str(voxpop.VoxPopEnvironment.get_db()))
		logging.critical("---> GeoDB: "+str(voxpop.VoxPopEnvironment.get_geodb()))
		logging.critical("---> CouchDB Connected to DB: " + voxpop.VoxPopEnvironment.get_db().connected_to())
		logging.critical("---> Memcache: "+str(voxpop.VoxPopEnvironment.get_memcache()))
		logging.critical("---> ITEMS: "+str(voxpop.VoxPopEnvironment.get_items(cache_worker=self.cache_worker)))
		cacheWorker = vp_workers.VoxPopWorker({'tube':self.cache_worker})
		cacheWorker.setDaemon(False)
		cacheWorker.start()
		app.run()

if __name__ == "__main__":
	logging.info("__MAIN__")
	producer = VoxPopProducer()
	producer.start()
