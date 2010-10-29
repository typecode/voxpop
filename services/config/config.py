import os, logging
from lib import yaml
from os import environ

class Config():

	data = None

	@classmethod
	def load(cls):
		config_url = 'config/config.yaml'
		stream = file(config_url, 'r')
	 	mode = 'dev'
		cls.data = yaml.load(stream)
		logging.info("Loaded Configuration File("+config_url+") with contents:\n" + str(yaml.dump(cls.data)))
		cls.data['base_url'] = cls.base_url()
		cls.data['mode'] = mode
	
	@classmethod
	def get(cls, key):
		if cls.data is None:
			cls.load()
		try:
			d = cls.data[key]
			if type(d) is str or type(d) is int:
				return d
			else:
				return d[0]	# dict of strs
		except KeyError:
			logging.error("Config Key Not Found: "+str(key))
			return None

	@classmethod
	def get_all(cls):
		if cls.data is None:
			cls.load()
		return cls.data

	@classmethod
	def dev(cls):
		try:
			dev = os.environ['SERVER_SOFTWARE'].startswith('Dev')
		except:
			dev = False		
		return dev
		
	@classmethod
	def base_url(cls):
		try:
 			return "http://" + environ['HTTP_HOST']
		except KeyError:
			return None
			
