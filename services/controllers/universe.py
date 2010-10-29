import logging, os, urllib, sys, hashlib, threading, operator
import simplejson as json
from config.config import *
from lib.typecode.util import *
from nltk import *
import voxpop
import vp.itemManager as itemManager
import vp.item as item
from controllers.controller import *

class Universe(Controller):
	
	def GET(self, _1="", _2=""):
		logging.info("#### Universe.get -> " + _1 + " - " + _2)
		if _1 == 'top' and _2 == "": return self.get_top_conversations()
		return self.json_not_found()
		
	def get_top_conversations(self):
		logging.error("#### Universe.get_top_conversations[]")
		topics = None
		with voxpop.VPE.memcache_lock:
			topics = voxpop.VPE.get_memcache().get('_design/universe/_view/top'.encode('utf-8'))
		if not topics:
			with voxpop.VPE.db_lock:
				topics = json.loads(voxpop.VPE.get_db().open_document('_design/universe/_view/top'))['rows']
			topics.reverse()
			topics = topics[:15]
			with voxpop.VPE.memcache_lock:
					voxpop.VPE.get_memcache().set('_design/universe/_view/top'.encode('utf-8'), topics, 500)
		return self.json(topics)
