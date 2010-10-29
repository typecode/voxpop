#!/usr/bin/env python

import logging
import voxpop as voxpop
import config
import vp.itemManager as itemManager
import vp.item as item
import vp_workers

from lib import web

#import lib.tornado.httpserver
#import lib.tornado.ioloop
#import lib.tornado.web

from lib import couch
from lib import yaml

import lib.memcache.memcache as memcache
from lib.beanstalk import serverconn

import controllers.query as query

import nyt.nytScraper

ROUTES = (
	r'/stats/?([^/.]*)/?([^/.]*)', 'controllers.stats.Stats',
	r'/status/?([^/.]*)/?([^/.]*)', 'controllers.status.Status',
	r'/timeline/?([^/.]*)/?([^/.]*)', 'controllers.timeline.Timeline',
	r'/readmodal/?([^/.]*)/?([^/.]*)', 'controllers.readmodal.Readmodal',
	r'/map/?([^/.]*)/?([^/.]*)', 'controllers.map.Map',
	r'/universe/?([^/.]*)/?([^/.]*)', 'controllers.universe.Universe',
	r'/dashboard/?([^/.]*)/?([^/.]*)', 'controllers.dashboard.Dashboard',
	r'/query/?([^/.]*)/?([^/.]*)', 'controllers.query.Query',
	r'/text/', 'controllers.text.Text',
	r'/voxpop/?([^/.]*)/?([^/.]*)', 'controllers.main.Main',
	r'/?([^/.]*)', 'controllers.main.Main'
)

#class TornadoHandler(lib.tornado.web.RequestHandler):
#	def get(self):
#		self.write("Hello, world")
#
#TORNADO_ROUTES = [
#	(r"/", TornadoHandler)
#]


class VoxPopProducer():
	cache_worker = 'producer0'
	
	def start(self):
		logging.info('---> Logger Initialized')
		logging.critical("---> VoxPop Producer started!")
		web.debug = True
		app = web.application(ROUTES, globals(), True)
		logging.critical("---> DB: "+str(voxpop.VPE.get_db()))
		logging.critical("---> GeoDB: "+str(voxpop.VPE.get_geodb()))
		logging.critical("---> CouchDB Connected to DB: " + voxpop.VPE.get_db().connected_to())
		logging.critical("---> Memcache: "+str(voxpop.VPE.get_memcache()))
		logging.critical("---> ITEMS: "+str(voxpop.VPE.get_items(cache_worker=self.cache_worker)))
		logging.critical("---> NYT Scraper: "+str(voxpop.VPE.get_scraper()))
		#logging.critical("---> Classifier: "+str(voxpop.VPE.get_classifier()))
		cacheWorker = vp_workers.VoxPopWorker({'tube':self.cache_worker})
		cacheWorker.setDaemon(False)
		cacheWorker.start()
		app.run()
		
		#tornado_app = lib.tornado.web.Application(TORNADO_ROUTES)
		#http_server = lib.tornado.httpserver.HTTPServer(tornado_app)
		#http_server.listen(99999)
		#lib.tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
	logging.info("__MAIN__")
	producer = VoxPopProducer()
	producer.start()
