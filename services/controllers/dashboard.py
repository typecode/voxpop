import logging, os, urllib, sys, hashlib, threading, operator
import simplejson as json
from config.config import *
from util import *
from nltk import *
import voxpop
import itemManager, item
from controllers.controller import *

class Dashboard(Controller):
	
	def GET(self, _1="", _2=""):
		logging.info("#### Dashboard.get -> " + _1 + " - " + _2)
		if _1 == 'children' and _2 != "": return self.get_children(_2)
		if _1 == 'facets' and _2 == "": return self.get_facets()
		if _1 == 'top' and _2 == "": return self.get_top_conversations()
		return self.json_not_found()
	
	def get_children(self,_id):
		logging.info("#### Dashboard.get_children[]")
		item = voxpop.VoxPopEnvironment.get_items().get(_id=_id)
		_myChildren = []
		_myChildrenList = sorted(item.children)
		for i in _myChildrenList:
			_child = voxpop.VoxPopEnvironment.get_items().get(_id=i)
			if _child is not None:
				_myChildren.append(_child.doc)
		return self.json({'doc':item.doc, 'rows':_myChildren, 'n_children':len(item.children)})
		
	def get_facets(self):
		logging.info("#### Dashboard.get_facets[]")
		with voxpop.VoxPopEnvironment.memcache_lock:
			facets = voxpop.VoxPopEnvironment.get_memcache().get('/dashboard/facets'.encode('utf-8'))
		if facets:
			return self.json(facets)
		with voxpop.VoxPopEnvironment.db_lock:
			des = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/facets/_view/des'))['rows']
		des_obj = {}
		for i in des:
			des_obj[i['id']] = i
		des_dist = FreqDist()
		for i in des:
			if 'counts' in i['value']:
				if 'comment' in i['value']['counts']:
					des_dist.inc(i['id'],i['value']['counts']['comment'])
		my_des_obj = {}
		for i in des_dist.samples()[:10]:
			my_des_obj[i] = des_obj[i]
		with voxpop.VoxPopEnvironment.db_lock:
			geo = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/facets/_view/geo'))['rows']
		geo_obj = {}
		for i in geo:
			geo_obj[i['id']] = i
		geo_dist = FreqDist()
		for i in geo:
			if 'counts' in i['value']:
				if 'comment' in i['value']['counts']:
					geo_dist.inc(i['id'],i['value']['counts']['comment'])
		my_geo_obj = {}
		for i in geo_dist.samples()[:10]:
			my_geo_obj[i] = geo_obj[i]
		with voxpop.VoxPopEnvironment.db_lock:
			per = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/facets/_view/per'))['rows']
		per_obj = {}
		for i in per:
			per_obj[i['id']] = i
		per_dist = FreqDist()
		for i in per:
			if 'counts' in i['value']:
				if 'comment' in i['value']['counts']:
					per_dist.inc(i['id'],i['value']['counts']['comment'])
		my_per_obj = {}
		for i in per_dist.samples()[:10]:
			my_per_obj[i] = per_obj[i]
			
		with voxpop.VoxPopEnvironment.db_lock:
			org = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/facets/_view/org'))['rows']
		org_obj = {}
		for i in org:
			org_obj[i['id']] = i
		org_dist = FreqDist()
		for i in org:
			if 'counts' in i['value']:
				if 'comment' in i['value']['counts']:
					org_dist.inc(i['id'],i['value']['counts']['comment'])
		my_org_obj = {}
		for i in org_dist.samples()[:10]:
			my_org_obj[i] = org_obj[i]	
			
		facets = {'des':my_des_obj, 'des_dist':des_dist.samples(), 'geo':my_geo_obj, 'geo_dist':geo_dist.samples(), 'per':my_per_obj, 'per_dist':per_dist.samples(), 'org':my_org_obj, 'org_dist':org_dist.samples()}
		with voxpop.VoxPopEnvironment.memcache_lock:
				voxpop.VoxPopEnvironment.get_memcache().set('/dashboard/facets'.encode('utf-8'), facets, 30)
		return self.json(facets)
		
	def get_top_conversations(self):
		logging.error("#### Dashboard.get_top_conversations[]")
		with voxpop.VoxPopEnvironment.memcache_lock:
			combined_topics = voxpop.VoxPopEnvironment.get_memcache().get('_design/caches/_view/list'.encode('utf-8'))
		if not combined_topics:
			with voxpop.VoxPopEnvironment.db_lock:
				topics = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/facets/_view/n_lasswell'))['rows']
			topics.sort(key=operator.itemgetter('value'))
			topics.reverse()
			topics = topics[:10]
			with voxpop.VoxPopEnvironment.memcache_lock:
					voxpop.VoxPopEnvironment.get_memcache().set('_design/caches/_view/list'.encode('utf-8'), combined_topics, 10)
		return self.json(topics)
