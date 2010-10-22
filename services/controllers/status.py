import logging, os, threading, urllib, simplejson
import voxpop
from controllers.controller import *

from lib.beanstalk import serverconn

class Status(Controller):
	
	def GET(self, _1=None, _2=None):
		logging.info("#### Status.get[]")
		if _1 == 'beanstalkd': 
			return self.get_beanstalkd_status()
		else:
			return self.json_not_found()
		
	def get_beanstalkd_status(self):
		logging.info("#### Status.get_beanstalkd_status[]")
		queue = serverconn.ServerConn('0.0.0.0', 11300)
		response = {'system': queue.stats(), 'tubes': []}
		for tube in queue.list_tubes()['data']:
			response['tubes'].append(queue.stats_tube(tube))
		return self.json(response)