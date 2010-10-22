#!/usr/bin/env python
import os, logging, threading, pickle, time, urllib
import simplejson as json
from lib import httplib2
from lib import web
from lib import couch
from lib import yaml
from lib.beanstalk import serverconn

def make_api_request(pars={}):
	if 'url' not in pars:
		logging.error("$$$$ api.make_api_request.NO_URL_PROVIDED")
		return False
	logging.critical("$$$$ api.make_api_request["+pars['url']+"]")
	
	output = {}
	for k, v in pars.iteritems():
		output[k] = v
	output['r_url'] = pars['url']
	response = fetch_request(output['r_url'])
	
	output['r_headers'] = str(response.info())
	resp = response.read()
	resp.decode("utf-8")
	#logging.error("API Responded with Response:\n" + str(resp))
	
	if 'format' not in pars or pars['format'] == 'json':
		try:
			logging.info("Decoding JSON response.")
			if resp != None and type(resp) == type(u"") and resp.find(u'\u2019') >= 0 : resp = resp.replace(u'\u2019', '\'')
			output['json'] = json.loads(resp)
			return output
		except ValueError:
			logging.error("$$$$ api.make_api_request[...]: Error on URL:["+str()+"]")
			logging.error("$$$$ api.make_api_request[...]: Error while Decoding JSON response.["+str(response.read())+"]")
			return False
	elif pars['format'] == 'text':
		output['text'] = resp
		return output
	elif pars['format'] == 'xml':
		output['text'] = resp
		return output
	
	
	
def fetch_request(url=None):
	logging.info("$$$$ api.fetch_request["+url+"]")
	if url is not None:
		result = urllib.urlopen(url)
		return result
	else:
		raise NoUrlError()
		return
	
class NoUrlError(Exception):
	def __init__(self):
		logging.error("Request Initiated without URL")
	
class BadResourceTypeError(Exception):
	def __init__(self,resource=None):
		logging.error("Bad or No Return Resource Defined ["+str(resource)+"]")