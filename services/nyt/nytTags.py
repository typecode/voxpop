#!/usr/bin/env python
import os, logging, threading, pickle, time, sys
import itemManager, item
import voxpop
import api
import nytCommunity
from api import *
from lib import httplib2
from lib import web
from lib import couch
from lib import yaml

def fetch_tags_for_query(query=None,**kwargs):
	logging.error("$$$$ nytTags._get_times_tags_for_query["+str(query)+"]")
	
	if query is None or len(query) == 0:
		logging.error("No query provided!")
		return {'error':'No query provided!'}
		
	if 'cache_id' in kwargs:
		query = voxpop.VoxPopEnvironment.get_items()[kwargs['query_id']]
	else:
		query = voxpop.VoxPopEnvironment.get_items().get(pars={'kind':'tagQuery', 'name':query})
		
	prior_cached = len(query.children)
	
	if 'n_to_fetch' in kwargs:
		n_to_fetch = kwargs['n_to_fetch']
	else:
		n_to_fetch = 0
	
	_url = 'http://api.nytimes.com/svc/timestags/suggest?query='+query.replace(' ','+')+'&api-key='+Config.get('nyt_tags')['key']
	req_pars = {
					'url': _url,
					'cache_id': query.id(),
					'functions': [api.make_api_request,cache_response]
				}
	request = {}
	for k,v in req_pars.iteritems():
		request[k] = v
	with voxpop.VoxPopEnvironment.beanstalkd_lock:
		voxpop.VoxPopEnvironment.get_beanstalkd().use("nyttags")
		voxpop.VoxPopEnvironment.get_beanstalkd().put(pickle.dumps(request), pri=100000)
	return cache
	
def cache_response(message={}):
	if 'cache_id' not in message:
		logging.error("$$$$ nytTags.cache_response: No Query ID Provided")
		return False
	if len(message['json'][u'results']) <= 0:
		logging.error("$$$$ nytTags.cache_response: No Results To Cache")
		return False
	logging.info("$$$$ nytTags.cache_response[]")
	query = voxpop.VoxPopEnvironment.get_items()[message['cache_id']]
	for i in message['json'][u'results']:
		tag_id = "timesTag_"+str(i).replace(' ','')
		tag = voxpop.VoxPopEnvironment.get_items()[tag_id]
		query.add_child(item_id)
		tag.add_to_cache(query._id)
		tag.update_doc({'kind':'timesTag', 'text':i})
	return message
	
	
	