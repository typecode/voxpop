#!/usr/bin/env python

import logging, threading, pickle, time, inspect, signal, exceptions
import voxpop, config, vpNLP
import itemManager, item
from lib import couch
from lib import yaml
import lib.memcache.memcache as memcache
from lib.beanstalk import serverconn

class VoxPopWork(threading.Thread):
	def __init__(self,function,message):
		logging.info("#### VoxPopWorker.InterruptableThread.__init__")
		threading.Thread.__init__(self)
		self.result = None
		self.function = function
		self.message = message
		
	def run(self):
		logging.info("#### VoxPopWorker.InterruptableThread.run_function")
		if inspect.isfunction(self.function):
			self.result = self.function(self.message)
		while self.result is None:
			pass
		return self.result

class VoxPopWorker(threading.Thread):
	
	def __init__(self,args):
		logging.info("#### VoxPopWorker.__init__")
		self.queue = serverconn.ServerConn('0.0.0.0', 11300)
		self.retries = {}
		threading.Thread.__init__(self)
		self.type = 'default'
		if 'tube' in args:
			self.type = args['tube']
			self.queue.watchlist = [args['tube']]
		if 'delay' in args:
			self.delay = float(args['delay'])
		else:
			self.delay = 0.0
		if 'max_retries' in args:
			self.max_retries = args['max_retries']
		else:
			self.max_retries = 4
		if 'retry_delay' in args:
			self.retry_delay = args['retry_delay']
		else:
			self.retry_delay = 2
		worklog = logging.getLogger(self.type)
		worklog.critical("#### VoxPopWorker: WORKER ADDED " + str(self.type) + " with delay " + str(self.delay))

	def run(self):
		logging.info("#### VoxPopWorker.run()")
		try:
			while True:
				i = self.queue.reserve()
				if i is not None:
					try:
						message = pickle.loads(i['data'])
						logging.info("#### VoxPopWorker.run:"+self.type+" JOB "+str(i['jid'])+" PROCESSING")
						result = self.process_functions(message,5.0)
						if result is not False:
							logging.info("#### VoxPopWorker.run:"+self.type+" JOB "+str(i['jid'])+" COMPLETED")
							self.queue.delete(i['jid'])
						else:
							logging.error("#### VoxPopWorker.run:"+self.type+" JOB "+str(i['jid'])+" FAILED")
							logging.error("#### VoxPopWorker.run:"+self.type+" JOB "+str(i['jid'])+": "+str(message['functions']))
							if i['jid'] in self.retries:
								if self.retries[i['jid']] > self.max_retries:
									self.queue.delete(i['jid'])
									del self.retries[i['jid']]
									logging.warning("#### VoxPopWorker.run:"+self.type+" JOB "+str(i['jid'])+" DELETED")
								else:
									self.retries[i['jid']] += 1
									self.queue.release(i['jid'], str(int(self.retries[i['jid']]) * 100), str(self.retry_delay));
									logging.info("#### VoxPopWorker.run:"+self.type+" JOB "+str(i['jid'])+" RETRIED")
							else:
								self.retries[i['jid']] = 1
								self.queue.release(i['jid'], str(int(self.retries[i['jid']]) * 100), str(self.retry_delay));
								logging.warning("#### VoxPopWorker.run:"+self.type+" JOB "+str(i['jid'])+" RETRIED")
						if self.delay > 0.0:
							logging.info("DELAYING: "+str(self.delay))
							time.sleep(self.delay)
					except pickle.PickleError:
						message = i;
					except KeyError:
						message = i;
		except KeyboardInterrupt:
			raise
			self.interrupt_main()
	
	def process_functions(self,message,timeout=None):
		logging.info("#### VoxPopWorker.process_functions()")
		if 'functions' not in message:
			return False
		else:
			def _run(i=None,msg=None):
				if i is None:
					i = 0
				if msg is None:
					msg = message
				if inspect.isfunction(msg['functions'][i]):
					work = VoxPopWork(msg['functions'][i],msg)
					work.start()
					work.join(timeout)
					if work.isAlive():
						return False
					else:
						if work.result is False:
							return work.result
						if i+1 < len(msg['functions']):
							return _run(i+1,work.result)
						else:
							return work.result
			return _run()

class VoxPopWorkers():
	workers = []
	cache_worker = 'workers0cache'

	def __init__(self):
		logging.info("#### VoxPopWorkers.__init__")
		logging.critical("---> VoxPop Workers started!")
		logging.critical("---> DB: "+str(voxpop.VoxPopEnvironment.get_db()))
		logging.critical("---> GeoDB: "+str(voxpop.VoxPopEnvironment.get_geodb()))
		logging.critical("---> CouchDB Connected to DB: " + voxpop.VoxPopEnvironment.get_db().connected_to())
		logging.critical("---> Memcache: "+str(voxpop.VoxPopEnvironment.get_memcache()))
		logging.critical("---> ITEMS: "+str(voxpop.VoxPopEnvironment.get_items(persist=True,cache_worker=self.cache_worker)))
		lasswell = vpNLP.LasswellParser()
		
	def add_worker(self,**kwargs):
		w = VoxPopWorker(kwargs)
		w.setDaemon(False)
		self.workers.append(w)

	def start(self):
		for i in self.workers:
			i.start()
			
if __name__ == "__main__":
	workers = VoxPopWorkers()
	workers.add_worker(tube='nytarticle', delay=0.25, retry_delay=2)
	workers.add_worker(tube='nytcommunity', delay=0.25, retry_delay=2)
	workers.add_worker(tube='nyttags', delay=0.25, retry_delay=2)
	workers.add_worker(tube='nlp')
	workers.add_worker(tube='nlp')
	workers.add_worker(tube='geocodelocal')
	workers.add_worker(tube='geocodegmaps',delay=1.75)
	workers.add_worker(tube='stats')
	workers.add_worker(tube='stats')
	workers.add_worker(tube=workers.cache_worker, retry_delay=2)
	workers.add_worker(tube=workers.cache_worker, retry_delay=2)
	workers.start()
	
	