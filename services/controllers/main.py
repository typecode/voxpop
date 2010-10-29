import logging, os
import voxpop
from controllers.controller import *

class Main(Controller):
	
	def GET(self,_1=None,_2=None):
		logging.info("#### VoxPop")
		if _1 == 'namelookup':
			return self.get_name_lookup()
		return self.get_home()
		
	def get_home(self):
		logging.info("##### VoxPop.get_home")
		return self.json({'voxpop':"0.2"})
		
	def get_name_lookup(self):
		logging.info("##### VoxPop.get_name_lookup")
		with voxpop.VPE.memcache_lock:
			_myNames = voxpop.VPE.get_memcache().get('_design/names/_view/all'.encode('utf-8'))
		if not _myNames:
			with voxpop.VPE.db_lock:
				names = json.loads(voxpop.VPE.get_db().open_document('_design/names/_view/all'))['rows']
				_myNames = {}
				for i in names:
					_myNames[i['key']] = i['value']
			with voxpop.VPE.memcache_lock:
					voxpop.VPE.get_memcache().set('_design/names/_view/all'.encode('utf-8'), _myNames, 600)
		return self.json({'names':_myNames})