import logging, os, urllib, sys, hashlib, threading, operator
import simplejson as json
from config import *
from util import *
from nltk import *
import voxpop
import vpStats
import itemManager, item
from controllers.controller import *

class Map(Controller):
	
	def GET(self, _1="", _2=""):
		logging.info("#### Map.get -> " + _1 + " - " + _2)
		if _1 == 'children' and _2 != "": return self.get_geo_children(_2)
		return self.json_not_found()
		
	def get_geo_children(self,_id):
		logging.error("#### Map.get_geo_children["+str(_id)+"]")
		with voxpop.VoxPopEnvironment.memcache_lock:
			_output = voxpop.VoxPopEnvironment.get_memcache().get('geoChildren_'+str(_id).encode('utf-8'))
		if not _output:
			_ids = [_id]
			if ',' in _id:
				_ids = _id.split(',')
			geo_locs = None
			with voxpop.VoxPopEnvironment.memcache_lock:
				geo_locs = voxpop.VoxPopEnvironment.get_memcache().get('_design/geo/_view/children/'+_ids[0].encode('utf-8'))
			if not geo_locs:
				with voxpop.VoxPopEnvironment.db_lock:
					geo_locs = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/geo/_view/children',key='"'+_ids[0]+'"'))['rows']
				with voxpop.VoxPopEnvironment.memcache_lock:
					voxpop.VoxPopEnvironment.get_memcache().set('_design/geo/_view/children/'+_ids[0].encode('utf-8'), geo_locs, 600)
			_aggregateSentiment = {}
			_aggregateSentiment['n_positive'] = 0
			_aggregateSentiment['n_negative'] = 0
			_aggregateSentiment['ratio'] = 0.5
			_myGeos = {}
			_relatedFacets = FreqDist()
			_child_count = 0
			for i in geo_locs:
				if 'caches' in i['value']:
					if len(_ids) > 1:
						_matches = True
						for j in _ids:
							if j not in i['value']['caches']:
								_matches = False
						if not _matches:
							continue
					for j in i['value']['caches']:
						_relatedFacets.inc(j)
				
				_child_count = _child_count + 1
				
				if i['value']['geo']['name'] not in _myGeos:
					_myGeos[i['value']['geo']['name']] = {}
					_myGeos[i['value']['geo']['name']]['geo'] = i['value']['geo']
					_myGeos[i['value']['geo']['name']]['children'] = []
					_myGeos[i['value']['geo']['name']]['n_positive'] = 0
					_myGeos[i['value']['geo']['name']]['n_negative'] = 0
				_myGeos[i['value']['geo']['name']]['children'].append(i['id'])
				if 'n_positive' in i['value']:
					_myGeos[i['value']['geo']['name']]['n_positive'] = int(_myGeos[i['value']['geo']['name']]['n_positive']) + int(i['value']['n_positive'])
					_aggregateSentiment['n_positive'] = int(_aggregateSentiment['n_positive']) + int(i['value']['n_positive'])
				if 'n_negative' in i['value']:
					_myGeos[i['value']['geo']['name']]['n_negative'] = int(_myGeos[i['value']['geo']['name']]['n_negative']) + int(i['value']['n_negative'])
					_aggregateSentiment['n_negative'] = int(_aggregateSentiment['n_negative']) + int(i['value']['n_negative'])
			if (float(_aggregateSentiment['n_positive']) + float(_aggregateSentiment['n_negative'])) > 0:
				_aggregateSentiment['ratio'] = float(_aggregateSentiment['n_negative']) / (float(_aggregateSentiment['n_positive']) + float(_aggregateSentiment['n_negative']))
			else:
				_aggregateSentiment['ratio'] = 0.5
				
			for i in _relatedFacets:
				if int(_relatedFacets[i]) == int(_child_count):
					_relatedFacets.pop(i)
			
			_output = {'comments':_myGeos, 'n_comments':_child_count, 'related':_relatedFacets.keys()[:10], 'aggregateSentiment': _aggregateSentiment}
			with voxpop.VoxPopEnvironment.memcache_lock:
				voxpop.VoxPopEnvironment.get_memcache().set('geoChildren_'+str(_id).encode('utf-8'), _output, 300)
		return self.json(_output)