#!/usr/bin/env python
import os, logging, threading, pickle, time, hashlib, math, sys
import voxpop
from config import Config
import api
import itemManager, item
import vpNLP
import vpGeo
from api import *
from lib import httplib2
from lib import web
from lib import couch
from lib import yaml

def fetch_comments_for_article_id(pars={},**kwargs):
	if 'article_id' not in pars:
		logging.error("**** nytCommunity.fetch_comments_for_article: NO ARTICLE ID PROVIDED")
		return False
	if 'article_url' not in pars:
		logging.error("**** nytCommunity.fetch_comments_for_article: NO ARTICLE URL PROVIDED")
		return False
	logging.info("$$$$ nytCommunity.fetch_comments_for_article_id[id:"+pars['article_id']+",url:"+pars['article_url']+"]")
	_url = 'http://api.nytimes.com/svc/community/v2/comments/url/exact-match.json?'
	_url = _url + 'url='+urllib.quote_plus(pars['article_url'])
	_url = _url + '&sort=oldest'
	_url = _url + '&api-key='+Config.get('nyt_community')['key']
	request = {
				'url':_url,
				'article_id': pars['article_id'],
				'article_url': pars['article_url'],
				'functions': [api.make_api_request,fetch_remainder]
				}
	#logging.critical('BSM[fetch_comments_for_article_id] Size:'+str(sys.getsizeof(pickle.dumps(request))))
	with voxpop.VoxPopEnvironment.beanstalkd_lock:
		voxpop.VoxPopEnvironment.get_beanstalkd().use("nytcommunity")
		voxpop.VoxPopEnvironment.get_beanstalkd().put(pickle.dumps(request),pri=100000)
	return True
	
def fetch_remainder(message={}):
	if 'json' not in message:
		logging.error("$$$$ nytCommunity.fetch_remainder: ERROR NO JSON")
		return False
	if 'results' not in message['json']:
		logging.error("$$$$ nytCommunity.fetch_remainder: ERROR NO RESULTS IN JSON")
		return False
	if 'totalCommentsFound' not in message['json']['results']:
		logging.warning("$$$$ nytCommunity.fetch_remainder: NO COMMENTS FOUND")
		return message
	if int(message['json']['results']['totalCommentsFound']) <= 0:
		logging.warning("$$$$ nytCommunity.fetch_remainder: NO COMMENTS TO FETCH")
		return message
	if 'article_id' not in message:
		logging.error("$$$$ nytCommunity.fetch_remainder: ERROR NO ARTICLE_ID PROVIDED")
		return False
	if 'article_url' not in message:
		logging.error("**** nytCommunity.fetch_remainder: NO ARTICLE URL PROVIDED")
		return False
	
	logging.critical("$$$$ nytCommunity.fetch_remainder["+message['article_id'].encode('utf-8')+"]")
	article = voxpop.VoxPopEnvironment.get_items().get(_id=message['article_id'])
	if article is None:
		logging.error("$$$$ nytCommunity.fetch_remainder:ERROR Article Not Found")
		return False
		
	if 'n_comments_cached' not in article.doc:
		article.doc['n_comments_cached'] = 0
	if int(article.doc['n_comments_cached']) == int(message['json']['results']['totalCommentsFound']):
		logging.error("$$$$ nytCommunity.fetch_remainder:All Comments already cached.")
		return False
	
	_nCommentsToFetch = int(message['json']['results']['totalCommentsFound']) - article.doc['n_comments_cached']
	n_requests = int(math.ceil(_nCommentsToFetch / int(Config.get("nyt_community")["response_size"])))+1
	_nRequestsOffset = int(math.floor(article.doc['n_comments_cached'] / int(Config.get("nyt_community")["response_size"])))
	req_pars = 	{
					'article_id': message['article_id'],
					'article_url': message['article_url'],
					'functions': [api.make_api_request,cache_response]
				}
	logging.critical("$$$$ nytCommunity.fetch_remainder: adding "+str(n_requests)+" more requests at offset ["+str(_nRequestsOffset)+"]")
	for i in range(_nRequestsOffset,n_requests):
		request = {}
		for k,v in req_pars.iteritems():
			request[k] = v
		_url = 'http://api.nytimes.com/svc/community/v2/comments/url/exact-match.json?'
		_url = _url + 'url='+urllib.quote_plus(message['article_url'])
		_url = _url + '&offset='+str(i*25)
		_url = _url + '&sort=oldest'
		_url = _url + '&api-key='+Config.get('nyt_community')['key']
		request['url'] = _url
		#logging.critical('BSM[fetch_remainder] Size:'+str(sys.getsizeof(pickle.dumps(request))))
		with voxpop.VoxPopEnvironment.beanstalkd_lock:
			voxpop.VoxPopEnvironment.get_beanstalkd().use("nytcommunity")
			voxpop.VoxPopEnvironment.get_beanstalkd().put(pickle.dumps(request), pri=100000)
	return message
	
def cache_response(message={}):
	logging.info("$$$$ nytCommunity.cache_response[]")
	if 'article_id' not in message:
		logging.error("**** nytCommunity.cache_response: NO ARTICLE_ID PROVIDED")
		return False
	article = voxpop.VoxPopEnvironment.get_items().get(_id=message['article_id'])
	if article is None:
		logging.error("$$$$ nytCommunity.cache_response:ERROR Article Not Found")
		return False
	if 'n_comments_cached' not in article.doc:
		article.doc['n_comments_cached'] = 0
	if u'comments' in message['json'][u'results']:
		if len(message['json'][u'results'][u'comments']) > 0:
			for i in message['json'][u'results'][u'comments']:
				comment_id = 'comment_%(urlhash)s_%(seq)05d' % {'urlhash':hashlib.md5(message['article_url'].encode('utf-8')).hexdigest(), 'seq':i[u'commentSequence']}
				comment = voxpop.VoxPopEnvironment.get_items().get(_id=comment_id)
				comment.doc['kind'] = 'comment'
				comment.add_to_cache(article._id)
				if 'caches' in article.doc:
					for j in article.doc['caches']:
						comment.add_to_cache(j,True)
				comment.update_doc(i)
				article.doc['n_comments_cached'] = article.doc['n_comments_cached'] + 1
				article.add_child(comment_id)
				#logging.critical('BSM[cache_response.nlp] Size:'+str(sys.getsizeof(pickle.dumps({'comment_id':comment_id, 'functions':[process_comment]}))))
				#logging.critical('BSM[cache_response.geocodelocal] Size:'+str(sys.getsizeof(pickle.dumps({'comment_id':comment_id, 'functions':[geolocate_comment_local]}))))
				with voxpop.VoxPopEnvironment.beanstalkd_lock:
					voxpop.VoxPopEnvironment.get_beanstalkd().use("nlp")
					voxpop.VoxPopEnvironment.get_beanstalkd().put(pickle.dumps({'comment_id':comment_id, 'functions':[process_comment]}), pri=100000, delay=5)
					voxpop.VoxPopEnvironment.get_beanstalkd().use("geocodelocal")
					voxpop.VoxPopEnvironment.get_beanstalkd().put(pickle.dumps({'comment_id':comment_id, 'functions':[geolocate_comment_local]}), pri=100000, delay=5)
	return message
	
def process_comment(message={}):
	if 'comment_id' not in message:
		logging.error("$$$$ nytCommunity.process_comment:ERROR No Comment ID Provided")
		return False
	logging.info("$$$$ nytCommunity.process_comment["+message['comment_id']+"]")
	comment = voxpop.VoxPopEnvironment.get_items().get(_id=message['comment_id'])
	if comment is None:
		logging.error("$$$$ nytCommunity.process_comment:ERROR No Comment Found")
		return False
	if u'commentBody' not in comment.doc:
		logging.error("$$$$ nytCommunity.process_comment:ERROR No Comment Body Provided ["+message['comment_id']+"]")
		return False
	_nlp = vpNLP.LasswellParser().parse_paragraph(comment.doc[u'commentBody'])
	comment.update_doc({'NLP':_nlp})
	comment.trickle_up_change({'type':'NLP'})
	return True
	
def geolocate_comment_local(message={}):
	if 'comment_id' not in message:
		logging.error("$$$$ nytCommunity.geolocate_comment_local:ERROR No Comment ID Provided")
		return False
	logging.info("$$$$ nytCommunity.geolocate_comment_local["+str(message['comment_id'])+"]")
	comment = voxpop.VoxPopEnvironment.get_items().get(_id=message['comment_id'])
	if comment is None:
		logging.error("$$$$ nytCommunity.geolocate_comment_local:ERROR No Comment Found")
		return False
	if u'location' not in comment.doc:
		logging.error("$$$$ nytCommunity.geolocate_comment_local:ERROR No Comment 'location' Provided ["+message['comment_id']+"]")
		return False
	_geo = vpGeo.geocoder().get_geo_local(comment.doc[u'location'])
	if _geo is False:
		with voxpop.VoxPopEnvironment.beanstalkd_lock:
			voxpop.VoxPopEnvironment.get_beanstalkd().use("geocodegmaps")
			voxpop.VoxPopEnvironment.get_beanstalkd().put(pickle.dumps({'comment_id':message['comment_id'], 'functions':[geolocate_comment_gmaps]}), pri=100000, delay=5)
		return True
	comment.add_to_cache(_geo._id)
	_myGeo = _geo.doc
	_myGeo['key'] = _geo._id
	comment.update_doc({'geo':_geo.doc})
	return True

def geolocate_comment_gmaps(message={}):
	if 'comment_id' not in message:
		logging.error("$$$$ nytCommunity.geolocate_comment_gmaps:ERROR No Comment ID Provided")
		return True
	logging.error("$$$$ nytCommunity.geolocate_comment_gmaps["+str(message['comment_id'])+"]")
	comment = voxpop.VoxPopEnvironment.get_items().get(_id=message['comment_id'])
	if comment is None:
		logging.error("$$$$ nytCommunity.geolocate_comment_gmaps:ERROR No Comment Found")
		return True
	if u'location' not in comment.doc:
		logging.error("$$$$ nytCommunity.geolocate_comment_gmaps:ERROR No Comment 'location' Provided ["+message['comment_id']+"]")
		return True
	_geo = vpGeo.geocoder().get_geo_gmaps(comment.doc[u'location'])
	if _geo is False:
		return True
	comment.add_to_cache(_geo._id)
	_myGeo = _geo.doc
	_myGeo['key'] = _geo._id
	comment.update_doc({'geo':_geo.doc})
	return True