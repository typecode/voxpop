import logging, os, urllib, sys, threading, cgi, math, hashlib, pickle, copy, inspect
import simplejson as json
import lib.couch
from lib.restkit import *
import voxpop
from lib.couch import *
from config import *
from util import *
import vpStats

class Item():
	
	def __init__(self,_id=None,cache_worker=None,**kwargs):
		if _id is None:
			logging.error("**** Item.__init__: Item initialized without ID")
			return None
		logging.info("#### Item.__init__["+_id+"]["+str(self)+"]")
		self._id = _id
		if 'persist' in kwargs:
			self.persist = kwargs['persist']
		else:
			self.persist = False
		self.cache_worker = cache_worker
		self.doc = {}
		self.children = []
		self.descendents = []
		self.changes = {}
		self.update_sequence = 0
		self.save_jid = None
		self.save_sequence = 0
		self.init_stats = False
		self.stats_jid = None
		self.stats_sequence = 0
		self.load_doc()
		if 'pars' in kwargs:
			self.mix_in(kwargs['pars'])
		self.load_children()
		self.stats = vpStats.vpStats(self)
		
	def __call__(self,**kwargs):
		logging.info("#### Item.__call__[]")
		self.load_children()
		return self
		
	def __contains__(self,id):
		logging.info("#### Item.__contains__[]")
		self.load_children()
		return id in self.children
		
	def load_doc(self):
		logging.info("#### Item.load_cache_doc["+self._id+"]")
		try:
			with voxpop.VoxPopEnvironment.db_lock:
				_doc = json.loads(voxpop.VoxPopEnvironment.get_db().open_document(self._id))
			self.doc = dict(self.doc, **_doc)
		except TypeError, ResourceNotFound:
			return False
	
	def mix_in(self,pars):
		logging.info("#### Item.mix_in["+self._id+"]"+str(pars))
		_mix = {}
		for i in pars:
			_mix[i] = pars[i]
		self.doc = dict(_mix, **self.doc)
		
	def load_children(self):
		logging.info("#### Item.load_children["+self._id+"]")
		try:
			with voxpop.VoxPopEnvironment.db_lock:
				cached_couch = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/children/_view/for_key',key='"'+self._id+'"',include_docs='true'))
			if 'rows' in cached_couch:
				for i in cached_couch['rows']:
					if self.children.count(i['id']) == 0:
						self.children.append(i['id'])
		except (TypeError, ValueError, restkit.ResourceNotFound):
			logging.error("#### Item.load_children: COULD NOT FIND CHILDREN")
			
	def load_descendents(self):
		logging.info("#### Item.load_descendents["+self._id+"]")
		try:
			with voxpop.VoxPopEnvironment.db_lock:
				cached_couch = json.loads(voxpop.VoxPopEnvironment.get_db().open_document('_design/descendents/_view/for_key',key='"'+self._id+'"',include_docs='true'))
			if 'rows' in cached_couch:
				for i in cached_couch['rows']:
					if self.descendents.count(i['id']) == 0:
						self.descendents.append(i['id'])
		except (TypeError, ValueError, restkit.ResourceNotFound):
			logging.error("#### Item.load_descendents: COULD NOT FIND DESCENDENTS")
	
	def id(self):
		logging.info("#### Item.id["+self._id+"]")
		return self._id
		
	def update_doc(self,doc):
		logging.info("#### Item.update_doc["+self._id+"]"+str(doc))
		self.doc = dict(doc, **self.doc)
		self.save()
		
	def add_to_cache(self,_cid,_inherited=False):
		logging.info("#### Item.add_to_cache["+_cid+"]")
		_caches = []
		_caches_inherited = []
		if _inherited is True:
			if 'caches_inherited' in self.doc:
				_caches_inherited = self.doc['caches_inherited']
			if _caches_inherited.count(_cid) == 0:
				_caches_inherited.append(_cid)
			self.doc['caches_inherited'] = _caches_inherited
		else:
			if 'caches' in self.doc:
				_caches = self.doc['caches']
			if _caches.count(_cid) == 0:
				_caches.append(_cid)
			self.doc['caches'] = _caches
		self.save()
		
	def add_child(self,_cid):
		logging.info("#### Item.add_child["+self._id+"]["+_cid+"]")
		if self.children.count(_cid) == 0:
			self.children.append(_cid)
		if "_rev" not in self.doc:
			self.save()
	
	def remove_child(self,_cid):
		logging.info("#### Item.remove_child["+self._id+"]["+_cid+"]")
		if self.children.count(_cid) > 0:
			del self.children[self.children.index(_cid)]
			if self.children.count(_cid) > 0:
				self.remove_child(_cid)
			
	def add_descendent(self,_did):
		logging.info("#### Item.add_descendent["+self._id+"]["+_did+"]")
		if self.descendents.count(_did) == 0:
			self.descendents.append(_did)
		if "_rev" not in self.doc:
			self.save()
		
	def remove_descendent(self,_did):
		logging.info("#### Item.remove_descendent["+self._id+"]["+_did+"]")
		if self.descendents.count(_did) > 0:
			del self.descendents[self.descendents.index(_did)]
			if self.descendents.count(_did) > 0:
				self.remove_child(_did)
			
	def save(self):
		logging.info("#### Item.save["+self._id+"] seq:["+str(self.update_sequence)+"/"+str(self.save_sequence)+"/"+str(self.stats_sequence)+"]")
		self.update_sequence = self.update_sequence + 1
		self.persist_me()
		
	def trickle_up_change(self,changes=None,**kwargs):
		logging.info("#### Item.trickle_up_change["+self._id+"][]")
		if changes and 'type' in changes:
			if changes['type'] not in self.changes:
				self.changes[changes['type']] = 0
			self.changes[changes['type']] = self.changes[changes['type']] + 1
		for i in self.changes:
			logging.error("#### Item.trickle_up_change["+self._id+"]["+i+"]["+str(self.changes[i])+"]["+str(len(self.children))+"]")
			if self.changes[i] == len(self.children) or len(self.children) == 0:
				logging.info("#### Item.trickle_up_change["+self._id+"].trickling")
				if self.init_stats:
					self.run_stats_on_me()
				if 'caches' in self.doc:
					for j in self.doc['caches']:
						#if 'caches_inherited' not in self.doc or j not in self.doc['caches_inherited']:
						_item = voxpop.VoxPopEnvironment.get_items()[j]
						if _item is not None:
							_item.trickle_up_change({'type':i})
						
	def run_stats_on_me(self,**kwargs):
		logging.info("#### Item.run_stats_on_me["+self._id+"]["+str(self.stats_jid)+"]")
		if self.stats_jid is None:
			self.stats_sequence = self.stats_sequence + 1
			_req = {'item_id': self._id, 'functions': [run_stats_on_item]}
			#logging.critical('BSM[run_stats_on_me] Size:'+str(sys.getsizeof(pickle.dumps(_req))))
			with voxpop.VoxPopEnvironment.beanstalkd_lock:
				voxpop.VoxPopEnvironment.get_beanstalkd().use("stats")
				self.stats_jid = voxpop.VoxPopEnvironment.get_beanstalkd().put(pickle.dumps(_req),delay=5,pri=100000)
		
	def persist_me(self):
		logging.info("#### Item.persist_me["+self._id+"]["+str(self.save_jid)+"]")
		if self.save_jid is None:
			_mypri = 100000 - self.update_sequence + self.save_sequence - (3*(len(self.children) + len(self.descendents)))
			#logging.critical('BSM[STATS] Size:'+str(sys.getsizeof(pickle.dumps({'item_id': self._id, 'functions': [persist_item]}))))
			with voxpop.VoxPopEnvironment.beanstalkd_lock:
				voxpop.VoxPopEnvironment.get_beanstalkd().use(self.cache_worker)
				self.save_jid = voxpop.VoxPopEnvironment.get_beanstalkd().put(pickle.dumps({'item_id': self._id, 'functions': [persist_item]}), delay=5, pri=_mypri)
			self.save_sequence = self.save_sequence + 1
			self.update_sequence = 0

def run_stats_on_item(message={}):
	if 'item_id' not in message:
		logging.error("#### Item.run_stats_on_item: NO ITEM ID PROVIDED")
		return False
	logging.info("#### Item.run_stats_on_item["+message['item_id']+"]")
	item = voxpop.VoxPopEnvironment.get_items()[message['item_id']]
	if item is None:
		logging.error("#### Item.run_stats_on_item: ITEM NOT FOUND")
		return False
	item.stats_jid = None
	item.stats.run()
	return message

def persist_item(message={}):
	if 'item_id' not in message:
		return False
	logging.info("$$$$ Item.persist_item["+message['item_id']+"]")
	item = voxpop.VoxPopEnvironment.get_items()[message['item_id']]
	if item is None:
		logging.error("#### Item.persist_item: ITEM NOT FOUND")
		return False
	item.save_jid = None
	save_item(item)
	return message
	
def save_item(_item=None):
	if _item is None:
		return False
	logging.info("$$$$ Item.save_item["+_item._id+"]")
	def __resolve(_id):
		logging.warning("$$$$ Item.save_item.__resolve("+_id+")")
		with voxpop.VoxPopEnvironment.db_lock:
			couched = json.loads(voxpop.VoxPopEnvironment.get_db().open_document(_id))
		if '_rev' not in couched:
			logging.error("$$$$ Item.save_item.__resolve:ERROR No _REV in CouchDB")
			return False
		_item.doc['_rev'] = couched['_rev']
		_item.doc = dict(couched, **_item.doc)
		try:
			_save_doc = copy.copy(_item.doc)
			with voxpop.VoxPopEnvironment.db_lock:
				resp = voxpop.VoxPopEnvironment.get_db().save_document(_save_doc,_id)
			return True
		except CouchConflict:
			__resolve(_id)
			return False
	try:
		_myItem = copy.copy(_item.doc)
		with voxpop.VoxPopEnvironment.db_lock:
			response = json.loads(voxpop.VoxPopEnvironment.get_db().save_document(_myItem,_item._id))
		del _myItem
		if 'rev' in response:
			_item.doc['_rev'] = response['rev']
	except CouchConflict:
		__resolve(_item._id)
	return True
	
def bulk_save_items(cache=None):
	logging.info("$$$$ cache.bulk_save_items[]")
	def __resolve(_id):
		logging.info("$$$$ cache.bulk_save_items.__resolve("+_id+")")
		with voxpop.VoxPopEnvironment.db_lock:
			couched = json.loads(voxpop.VoxPopEnvironment.get_db().open_document(_id))
		if '_rev' in cache[_id]:
			del cache[_id]['_rev']
		resolved = dict(couched, **cache[_id])
		cache.set(_id,resolved,False)
		try:
			with voxpop.VoxPopEnvironment.db_lock:
				resp = voxpop.VoxPopEnvironment.get_db().save_document(cache[i['id']],_id)
			return True
		except CouchConflict:
			__resolve(_id)
			return False
	if cache is None:
		return False
	_docs = []
	for i in cache.changed_items:
		_docs.append(cache[i])
		del cache.changed_items[cache.changed_items.index(i)]
	if len(_docs) == 0:
		logging.info("$$$$ cache.bulk_save_items: NO DOCS TO SAVE")
		return True
	with voxpop.VoxPopEnvironment.db_lock:
		resp = voxpop.VoxPopEnvironment.get_db().bulk_save_documents(_docs)
	if resp is False:
		return False
	for i in resp:
		if 'rev' in i and 'id' in i:
			cache.set(i['id'],{'_rev':i['rev']},False)
		elif u'error' in i and i[u'error'] == u'conflict':
			logging.info("BULK SAVE CONFLICT: "+i[u'id'])
			if __resolve(i[u'id']):
				return True
	return True