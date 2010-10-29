import logging, os, urllib, sys, hashlib, threading, operator
import simplejson as json
from config.config import *
from lib.typecode.util import *
from nltk import *
import voxpop
import vp.vpStats
import vp.itemManager as itemManager
import vp.item as item
from controllers.controller import *

class Readmodal(Controller):
	
	def GET(self, _1="", _2=""):
		logging.info("#### Readmodal.get -> " + _1 + " - " + _2)
		if _1 == 'keys' and _2 != "": return self.get_rm_children(_2)
		if _1 == 'ids' and _2 != "": return self.get_rm_children_by_ids(_2)
		if _1 == 'articleid' and _2 != "": return self.get_rm_children_by_article_id(_2)
		return self.json_not_found()
		
	def get_rm_children(self,_id):
		logging.error("#### Readmodal.get_rm_children["+repr(_id)+"]")
		with voxpop.VPE.memcache_lock:
			_output = voxpop.VPE.get_memcache().get('readmodalChildren_'+_id.encode('utf-8'))
		if not _output:
			_ids = [_id]
			if ',' in _id:
				_ids = _id.split(',')
			comments = None
			with voxpop.VPE.db_lock:
				comments = json.loads(voxpop.VPE.get_db().open_document('_design/readmodal/_view/children',key='"'+_ids[len(_ids)-1]+'"'))['rows']
			articles = []
			_myComments = []
			_aggregateSentiment = {}
			_aggregateSentiment['n_positive'] = 0
			_aggregateSentiment['n_negative'] = 0
			_aggregateSentiment['ratio'] = 0.5
			for i in comments:
				if u'caches' in i['value']:
					if len(_ids) > 1:
						_matches = True
						for j in _ids:
							if j not in i['value']['caches']:
								_matches = False
						if not _matches:
							continue
					for j in i['value']['caches']:
						if j[0:8] == 'article_':
							i['article_id'] = j
							if j not in articles:
								articles.append(j)
				_aggregateSentiment['n_positive'] = _aggregateSentiment['n_positive'] + len(i['value']['lasswell']['positive'])
				_aggregateSentiment['n_negative'] = _aggregateSentiment['n_negative'] + len(i['value']['lasswell']['negative'])
				_myComments.append(i)
			_myArticles = {}
			for i in articles:
				with voxpop.VPE.db_lock:
					article = json.loads(voxpop.VPE.get_db().open_document(i))
				_myArticles[i] = article
			if (float(_aggregateSentiment['n_positive']) + float(_aggregateSentiment['n_negative'])) > 0:
				_aggregateSentiment['ratio'] = float(_aggregateSentiment['n_positive']) / (float(_aggregateSentiment['n_positive']) + float(_aggregateSentiment['n_negative']))
			else:
				_aggregateSentiment['ratio'] = 0.5
			_output = {'comments':_myComments,'articles':_myArticles, 'aggregateSentiment': _aggregateSentiment}
			with voxpop.VPE.memcache_lock:
					voxpop.VPE.get_memcache().set('readmodalChildren_'+_id.encode('utf-8'), _output, 600)
		return self.json(_output)
		
	def get_rm_children_by_ids(self,qid):
		logging.error("#### Readmodal.get_rm_children_by_ids["+str(qid)+"]")
		with voxpop.VPE.memcache_lock:
			_output = voxpop.VPE.get_memcache().get('readmodalChildrenById_'+str(qid).encode('utf-8'))
		if not _output:
			_ids = [web.input()['ids']]
			if ',' in web.input()['ids']:
				_ids = web.input()['ids'].split(',')
			_myArticleIds = []
			_myComments = []
			_aggregateSentiment = {}
			_aggregateSentiment['n_positive'] = 0
			_aggregateSentiment['n_negative'] = 0
			_aggregateSentiment['ratio'] = 0.5
			for i in _ids:
				_myComment = json.loads(voxpop.VPE.get_db().open_document(i))
				if u'caches' in _myComment:
					_myReducedComment = {}
					for j in _myComment[u'caches']:
						if j[0:8] == 'article_':
							_myReducedComment['article_id'] = j
							if _myArticleIds.count(j) == 0:
								_myArticleIds.append(j)
					_myReducedComment['value'] = {}
					_myReducedComment['value']['id'] = _myComment['_id']
					_myReducedComment['value']['approveDate'] = _myComment['approveDate']
					_myReducedComment['value']['commentBody'] = _myComment['commentBody']
					if 'geo' in _myComment and 'name' in _myComment['geo']:
						_myReducedComment['value']['geo_name'] = _myComment['geo']['name']
					_myReducedComment['value']['display_name'] = _myComment['display_name']
					_myReducedComment['value']['caches'] = _myComment['caches']
					_myReducedComment['value']['lasswell'] = {}
					_myReducedComment['value']['lasswell']['positive'] = _myComment['NLP']['lasswell_words']['positive']
					_aggregateSentiment['n_positive'] = _aggregateSentiment['n_positive'] + len(_myComment['NLP']['lasswell_words']['positive'])
					_myReducedComment['value']['lasswell']['negative'] = _myComment['NLP']['lasswell_words']['negative']
					_aggregateSentiment['n_negative'] = _aggregateSentiment['n_negative'] + len(_myComment['NLP']['lasswell_words']['negative'])
					_myComments.append(_myReducedComment)
			_myArticles = {}
			for i in _myArticleIds:
				with voxpop.VPE.db_lock:
					article = json.loads(voxpop.VPE.get_db().open_document(i))
				_myArticles[i] = article
				
			if (float(_aggregateSentiment['n_positive']) + float(_aggregateSentiment['n_negative'])) > 0:
				_aggregateSentiment['ratio'] = float(_aggregateSentiment['n_positive']) / (float(_aggregateSentiment['n_positive']) + float(_aggregateSentiment['n_negative']))
			else:
				_aggregateSentiment['ratio'] = 0.5
			_output = {'comments':_myComments,'articles':_myArticles, 'aggregateSentiment': _aggregateSentiment}
			with voxpop.VPE.memcache_lock:
					voxpop.VPE.get_memcache().set('readmodalChildrenById_'+str(qid).encode('utf-8'), _output, 600)
		return self.json(_output)
				
		
		def get_rm_children_by_article_id(self,aid):
			logging.error("#### Readmodal.get_rm_children_by_article_id["+str(aid)+"]")
			with voxpop.VPE.memcache_lock:
				_output = voxpop.VPE.get_memcache().get('readmodalChildrenByArticleId_'+str(aid).encode('utf-8'))
			if not _output:
				article = voxpop.VPE.get_items().get(_id=aid)
				for i in article.children:
					logging.error(i)
				_output = {}
				with voxpop.VPE.memcache_lock:
					pass
					#voxpop.VPE.get_memcache().set('readmodalChildrenById_'+str(qid).encode('utf-8'), _output, 600)
			return self.json(_output)