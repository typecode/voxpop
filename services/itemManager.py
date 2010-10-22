import logging
import item

class ItemManager():
	
	def __init__(self,**kwargs):
		logging.info("#### ItemManager.__init__[]")
		self.items = {}
		if 'persist' in kwargs:
			self.persist = kwargs['persist']
		else:
			self.persist = False
		if 'cache_worker' not in kwargs:
			logging.error("#### ItemManager.__init__[]: NO CACHE WORKER NAME PROVIDED")
			return None
		self.cache_worker = kwargs['cache_worker']
		
	def __call__(self):
		logging.info("#### ItemManager.__call__[]")
		logging.info("#### ItemManager.__call__: "+len(self.caches)+" items in memory")
		return self.items
		
	def __contains__(self,_id):
		logging.info("#### ItemManager.__contains__["+cid+"]")
		logging.info("#### ItemManager.__contains__: "+len(self.caches)+" items in memory")
		return _id in self.items
	
	def __getitem__(self,_id):
		logging.info("#### ItemManager.__getitem__["+_id+"]")
		if _id in self.items:
			return self.items[_id]
		else:
			return None
		
	def __setitem__(self,_id,value):
		logging.info("#### ItemManager.__setitem__["+_id+"]")
		if _id in self.items:
			self.items[_id] = value
		
	def get(self,**kwargs):
		_id = None
		if '_id' in kwargs:
			_id = kwargs['_id']
		else:
			if 'pars' in kwargs:
				_id = self.generate_key(kwargs['pars'])
		if _id is None:
			logging.info("#### ItemManager.get[] NO ID OR PARS PROVIDED")
		logging.info("#### ItemManager.get["+_id+"]")
		if _id in self.items:
			if not self.persist:
				return self.items[_id]()
			return self.items[_id]
		else:
			logging.info("#### ItemManager.get["+_id+"] DOES NOT EXIST")
			if '_id' in kwargs:
				del kwargs['_id']
			self.items[_id] = item.Item(_id,persist=self.persist,cache_worker=self.cache_worker,**kwargs)
			return self.items[_id]
			
	def generate_key(self,pars):
		logging.info("$$$$ ItemManager.generate_key["+str(pars)+"]")
		_id = None
		if 'name' in pars:
			if 'kind' in pars:
				_id = pars['kind'] + "_" + pars['name']
			else:
				_id = pars['name']
		return _id.replace(',','').replace(' ','')