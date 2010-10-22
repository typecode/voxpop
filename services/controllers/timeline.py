import logging, os, urllib, sys, hashlib, threading, math, decimal, datetime, time
#from lib import cluster as libcluster
from lib.cluster import cluster as libcluster
import simplejson as json
from config import *
from util import *
from nltk import *
import voxpop
import itemManager, item
from controllers.controller import *

class Timeline(Controller):
	
	cluster_points = True
	
	def GET(self, _1="", _2=""):
		logging.info("#### Timeline.get -> " + _1 + " - " + _2)
		if _1 == 'children' and _2 != "": return self.get_binned_children(_2)
		return self.json_not_found()
	
	def get_binned_children(self,_id):
		logging.info("#### Timeline.get_binned_children["+_id+"]")
		with voxpop.VoxPopEnvironment.memcache_lock:
			_output = voxpop.VoxPopEnvironment.get_memcache().get('timelineChildren_'+str(_id).encode('utf-8'))
		if not _output:
			_ids = [_id]
			if ',' in _id:
				_ids = _id.split(',')
			children = None
			with voxpop.VoxPopEnvironment.memcache_lock:
				children = voxpop.VoxPopEnvironment.get_memcache().get('_design/timeline/_view/children/'+_ids[0].encode('utf-8'))
			if not children:
				with voxpop.VoxPopEnvironment.db_lock:
					children = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/timeline/_view/children',key='"'+_ids[0]+'"'))['rows']
				with voxpop.VoxPopEnvironment.memcache_lock:
					voxpop.VoxPopEnvironment.get_memcache().set('_design/timeline/_view/children/'+_ids[0].encode('utf-8'), children, 600)
					
			logging.error("#### Timeline.get_binned_children.fetching_children["+_ids[0]+"].n_results:"+str(len(children)))
			
			for i in children:
				if 'timestamp' in i['value']:
					_myEarliestTimestamp = i['value']['timestamp']
					break
			_myLatestTimestamp = children[(len(children)-1)]['value']['timestamp']
			_myTimespan = int(_myLatestTimestamp) - int(_myEarliestTimestamp)
			_myChildrenList = []
			_myArticles = []
			_myBins = {}
			_bins = 0
			_mySmoothedSeries = {}
			_myLastSmoothedValue = None
			_relatedFacets = FreqDist()
			
			_aggregateSentiment = {}
			_aggregateSentiment['n_positive'] = 0
			_aggregateSentiment['n_negative'] = 0
			_aggregateSentiment['ratio'] = 0.5
			
			_child_count = 0
			_nComments = 0
			
			logging.error("#### Timeline.get_binned_children.loop.starting")
			for i in children:
				if i['value']['kind'] == 'article':
					if 'caches' in i['value']:
						if len(_ids) > 1:
							_matches = True
							for j in _ids:
								if j[0:8] == 'article_':
									_matches = False
									continue
								if j not in i['value']['caches']:
									_matches = False
							if not _matches:
								continue
						for j in i['value']['caches']:
							_relatedFacets.inc(j)
					_child_count = _child_count + 1
					if 'n_positive' not in i['value'] or 'n_negative' not in i['value']:
						continue
					_myChild = {}
					_myChild['key'] = i['value']['key']
					_myChild['n_positive'] = int(i['value']['n_positive'])
					_myChild['n_negative'] = int(i['value']['n_negative'])
					_myChild['title'] = i['value']['title']
					_myChild['timestamp'] = time.mktime(datetime.datetime.strptime(str(i['value']['date']),'%Y%m%d').timetuple()) - 43200
					_myArticles.append(_myChild)
					
				if i['value']['kind'] == 'comment':
					_nComments = _nComments + 1
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
					if 'n_positive' not in i['value'] or 'n_negative' not in i['value']:
						continue
					_myChild = {}
					_myChild['key'] = i['value']['key']
					_myChild['n_positive'] = int(i['value']['n_positive'])
					_aggregateSentiment['n_positive'] = _aggregateSentiment['n_positive'] + _myChild['n_positive']
					_myChild['n_negative'] = int(i['value']['n_negative'])
					_aggregateSentiment['n_negative'] = _aggregateSentiment['n_negative'] + _myChild['n_negative']
					if (int(i['value']['n_negative'] + int(i['value']['n_positive']))) > 0:
						_myChild['ratio'] = float(float(i['value']['n_positive']) / (float(i['value']['n_negative'] + float(i['value']['n_positive']))))
					else:
						_myChild['ratio'] = 0.5
					_myChild['aggregate'] = int(i['value']['n_positive']) - int(i['value']['n_negative'])
					_myChild['timestamp'] = int(i['value']['timestamp'])
					_myChild['kind'] = i['value']['kind']
					_myChildrenList.append(_myChild)
				
					_myBinnedTimestamp = str(decimal.Decimal(str(int(math.ceil(_myChild['timestamp']/(_myTimespan/25)))*(_myTimespan/25))))
					_myBinnedRatio = str(decimal.Decimal(str(int(_myChild['ratio']/0.05)*0.05)))
					if _myBinnedTimestamp not in _myBins:
						_myBins[_myBinnedTimestamp] = {}
					if _myBinnedRatio not in _myBins[_myBinnedTimestamp]:
						_bins = _bins + 1
						_myBins[_myBinnedTimestamp][_myBinnedRatio] = []
					_myBins[_myBinnedTimestamp][_myBinnedRatio].append(_myChild)
				
					_mySmoothedTimestamp = int(_myChild['timestamp']/(_myTimespan/50)) * (_myTimespan/50)
					if _mySmoothedTimestamp not in _mySmoothedSeries:
					
						if _myLastSmoothedValue is not None:
							_mySmoothedSeries[_mySmoothedTimestamp] = (_myChild['ratio']*0.1) + (_myLastSmoothedValue*0.9)
						else:
							_mySmoothedSeries[_mySmoothedTimestamp] = _myChild['ratio']
						_myLastSmoothedValue = _mySmoothedSeries[_mySmoothedTimestamp]
			logging.error("#### Timeline.get_children.loop.finished.n_children["+str(len(_myChildrenList))+"]")
			logging.error("#### Timeline.get_children.loop.finished.n_bins["+str(_bins)+"]")
			
			if (float(_aggregateSentiment['n_positive']) + float(_aggregateSentiment['n_negative'])) > 0:
				_aggregateSentiment['ratio'] = float(_aggregateSentiment['n_negative']) / (float(_aggregateSentiment['n_positive']) + float(_aggregateSentiment['n_negative']))
			else:
				_aggregateSentiment['ratio'] = 0.5
			
			for i in _relatedFacets:
				if int(_relatedFacets[i]) == int(_child_count):
					_relatedFacets.pop(i)
			
			_output = {'related':_relatedFacets.keys()[:10], 'n_comments': _nComments,'aggregateSentiment':_aggregateSentiment}
			if _mySmoothedSeries:
				_output['smoothed'] = _mySmoothedSeries
			if _myArticles:
				_output['articles'] = _myArticles
			if _myBins:
				_output['bins'] = _myBins
			else:
				_output['points'] = _myChildrenList
			
			with voxpop.VoxPopEnvironment.memcache_lock:
				voxpop.VoxPopEnvironment.get_memcache().set('timelineChildren_'+str(_id).encode('utf-8'), _output, 300)
		return self.json(_output)
	
	def get_children(self,_id):
		logging.info("#### Timeline.get_children["+_id+"]")
		with voxpop.VoxPopEnvironment.memcache_lock:
			_output = voxpop.VoxPopEnvironment.get_memcache().get('timelineChildren_'+str(_id).encode('utf-8'))
		if not _output:
			_ids = [_id]
			if ',' in _id:
				_ids = _id.split(',')
			children = None
			with voxpop.VoxPopEnvironment.memcache_lock:
				children = voxpop.VoxPopEnvironment.get_memcache().get('_design/timeline/_view/children/'+_ids[0].encode('utf-8'))
			if not children:
				with voxpop.VoxPopEnvironment.db_lock:
					children = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/timeline/_view/children',key='"'+_ids[0]+'"'))['rows']
				with voxpop.VoxPopEnvironment.memcache_lock:
					voxpop.VoxPopEnvironment.get_memcache().set('_design/timeline/_view/children/'+_ids[0].encode('utf-8'), children, 600)
					
			logging.error("#### Timeline.get_children.fetching_children["+_ids[0]+"].n_results:"+str(len(children)))
			
			_myEarliestTimestamp = children[0]['value']['timestamp']
			_myLatestTimestamp = children[(len(children)-1)]['value']['timestamp']
			_myTimespan = int(_myLatestTimestamp) - int(_myEarliestTimestamp)
			_myChildrenList = []
			_mySmoothedSeries = {}
			_myLastSmoothedValue = None
			_relatedFacets = FreqDist()
			logging.error("#### Timeline.get_children.loop.starting")
			for i in children:
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
				
				_myChild = {}
				if 'n_positive' not in i['value'] or 'n_negative' not in i['value']:
					continue
				_myChild['key'] = i['value']['key']
				_myChild['n_positive'] = int(i['value']['n_positive'])
				_myChild['n_negative'] = int(i['value']['n_negative'])
				if (int(i['value']['n_negative'] + int(i['value']['n_positive']))) > 0:
					_myChild['ratio'] = float(float(i['value']['n_negative']) / (float(i['value']['n_negative'] + float(i['value']['n_positive']))))
				else:
					_myChild['ratio'] = 0.5
				_myChild['aggregate'] = int(i['value']['n_positive']) - int(i['value']['n_negative'])
				_myChild['timestamp'] = int(i['value']['timestamp'])
				_myChild['kind'] = i['value']['kind']
				_myChildrenList.append(_myChild)
				
				_mySmoothedTimestamp = int(_myChild['timestamp']/(_myTimespan/10)) * (_myTimespan/10)
				if _mySmoothedTimestamp not in _mySmoothedSeries:
					if _myLastSmoothedValue is not None:
						_mySmoothedSeries[_mySmoothedTimestamp] = (_myChild['ratio']*0.1) + (_myLastSmoothedValue*0.9)
					else:
						_mySmoothedSeries[_mySmoothedTimestamp] = _myChild['ratio']
					_myLastSmoothedValue = _mySmoothedSeries[_mySmoothedTimestamp]
			logging.error("#### Timeline.get_children.loop.finished.n_children["+str(len(_myChildrenList))+"]")
			
			_myClusters = None
			if self.cluster_points:
				logging.error("#### Timeline.get_children.clustering.starting")
				def __childDistance(x,y):
					return math.sqrt( ( x['ratio']-y['ratio'] )**2 + ( x['timestamp']-y['timestamp'] )**2 )
			
				_clusterer = libcluster.KMeansClustering(_myChildrenList,__childDistance)
				_myClusters = _clusterer.getclusters(50)
				logging.error("#### Timeline.get_children.clustering.finished")
			
			_output = {'related':_relatedFacets}
			if _mySmoothedSeries:
				_output['smoothed'] = _mySmoothedSeries
			if _myClusters:
				_output['clusters'] = _myClusters
			else:
				_output['points'] = _myChildrenList
			
			with voxpop.VoxPopEnvironment.memcache_lock:
				voxpop.VoxPopEnvironment.get_memcache().set('timelineChildren_'+str(_id).encode('utf-8'), _output, 300)
		return self.json(_output)