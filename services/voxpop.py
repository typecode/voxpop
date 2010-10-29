#!/usr/bin/env python
import logging, threading
import lib.typecode.logger
import config.config as Config
import vp.itemManager as itemManager
import vp.item as item
from lib import couch
import lib.memcache.memcache as memcache
from lib.beanstalk import serverconn
from vp import vpClassifier
import nyt.nytScraper

class VPE():
	
	db = None
	db_lock = threading.Lock()
	geodb = None
	geodb_lock = threading.Lock()
	memcache = None
	memcache_lock = threading.BoundedSemaphore(5)
	beanstalkd = None
	beanstalkd_lock = threading.Lock()
	items = None
	items_lock = threading.Lock()
	classifier = None
	classifier_lock = threading.Lock()
	scraper = None
	scraper_lock = threading.Lock()
	
	def __init__(self):
		logging.error('#### VPE.__init__')
		
	@classmethod
	def get_db(cls):
		if not cls.db:
			db = couch.Couch(Config.Config.get('couchdb')['url'])
			db.open_database('voxpop_dev')
			cls.db = db
		return cls.db
		
	@classmethod
	def get_geodb(cls):
		if not cls.geodb:
			geodb = couch.Couch(Config.Config.get('couchdb')['url'])
			geodb.open_database('voxpop_geo')
			cls.geodb = geodb
		return cls.geodb
		
	@classmethod
	def get_memcache(cls):
		if not cls.memcache:
			mc = memcache.Client(['127.0.0.1:11211'], debug=0)
			cls.memcache = mc
		return cls.memcache
		
	@classmethod
	def get_beanstalkd(cls,**kwargs):
		if not cls.beanstalkd:
			bs = serverconn.ServerConn('0.0.0.0', 11300)
			cls.beanstalkd = bs
		return cls.beanstalkd
		
	@classmethod
	def get_items(cls,**kwargs):
		if not cls.items:
			c = itemManager.ItemManager(**kwargs)
			cls.items = c
		return cls.items
		
	@classmethod
	def get_classifier(cls,**kwargs):
		if not cls.classifier:
			c = vpClassifier.vpClassifier(**kwargs)
			cls.classifier = c
		return cls.classifier
		
	@classmethod
	def get_scraper(cls,**kwargs):
		if not cls.scraper:
			c = nyt.nytScraper.nytScraper(**kwargs)
			cls.scraper = c
		return cls.scraper
		
	@classmethod
	def get_quote(cls):
		return "It is not the critic who counts; not the man who points out how \
			the strong man stumbles, or where the doer of deeds could have done \
			them better. The credit belongs to the man who is actually in the arena, \
			whose face is marred by dust and sweat and blood, who strives valiantly; \
			who errs and comes short again and again; because there is not effort \
			without error and shortcomings; but who does actually strive to do the \
			deed; who knows the great enthusiasm, the great devotion, who spends \
			himself in a worthy cause, who at the best knows in the end the triumph \
			of high achievement and who at the worst, if he fails, at least he fails \
			while daring greatly. So that his place shall never be with those cold \
			and timid souls who know neither victory nor defeat. -Theodore Roosevelt"
		