#!/usr/bin/env python
import os, logging, threading, pickle, time, math, sys
import voxpop
from config.config import Config
import vp.itemManager as itemManager
import vp.item as item
import nyt.nytCommunity as nytCommunity
import vp.api as api
from lib import httplib2
from lib import web
from lib import couch
from lib import yaml

def fetch_articles_for_query(query_text=None,**kwargs):
	"""
	Kicks off the process of fetching articles for a user input search query.
	"""
	logging.error("$$$$ nytArticles.fetch_articles_for_query["+str(query_text)+"]")
	
	if query_text is None or len(query_text) == 0:
		logging.error("No query_text provided!")
		return {'error':'No query_text provided!'}
	
	if 'query_id' in kwargs:
		query = voxpop.VPE.get_items().get(_id=kwargs['query_id'])
	else:
		query = voxpop.VPE.get_items().get(pars={'kind':'articleQuery','name':query_text})
	
	query.save()
	
	logging.error(query_text)
	logging.error(query.doc)
	
	if 'query_text' not in query.doc:
		query.doc['query_text'] = query_text
		
	if 'n_fetched' not in query.doc:
		query.doc['n_fetched'] = 0
	
	query.init_stats = True
	query.save()
	
	#get_new_articles_for_query(query)
	get_old_articles_for_query(query)
	
	return query
	
def fetch_articles_for_times_topic(topic=None):
	"""
	Kicks off the process of fetching articles for a scraped TimesTopic.
	"""
	logging.error("$$$$ nytArticles.fetch_articles_for_times_topic["+str(topic)+"]")
	
	if topic is None or len(topic) == 0:
		logging.error("No topic provided!")
		return {'error':'No topic provided!'}
	
	query = voxpop.VPE.get_items().get(pars={
		'kind':'articleScraped',
		'name':topic
	})
	
	if 'query_text' not in query.doc:
		query.doc['query_text'] = topic
	if 'n_fetched' not in query.doc:
		query.doc['n_fetched'] = 0
	
	query.init_stats = True
	query.save()
	
	get_old_articles_for_query(query)
	return query
	
def get_new_articles_for_query(query):
	"""
	Fetches items for a query that are newer than the newest item that has 
	already been fetched.
	"""
	logging.error("$$$$ nytArticles.get_new_articles_for_query[]")

	for i in range(0,n_requests):
		request = {}
		for k,v in req_pars.iteritems():
			request[k] = v
		request['url'] = 'http://api.nytimes.com/svc/search/v1/article?query=text:'+query.doc['query_text'].replace(' ','+')+'+comments:y'
		request['url'] = request['url'] + '&offset='+str(prior_cached + (i * int(Config.get("nyt_article")["response_size"])))
		request['url'] = request['url'] + '&fields=body,byline,date,title,url,geo_facet,per_facet,des_facet,org_facet'
		request['url'] = request['url'] + '&api-key='+Config.get('nyt_article')['key']
		
		#logging.critical('BSM[get_new_articles_for_query] Size:'+str(sys.getsizeof(pickle.dumps(request))))
		with voxpop.VPE.beanstalkd_lock:
			voxpop.VPE.get_beanstalkd().use("nytarticle")
			voxpop.VPE.get_beanstalkd().put(pickle.dumps(request), pri=100000)
	return message

def get_old_articles_for_query(query):
	"""
	Fetches items for a query that are older than the oldest item that has 
	already been fetched.
	"""
	logging.error("$$$$ nytArticles.get_old_articles_for_query[]")
	n_to_fetch = 10
	query.doc['n_fetched'] = query.doc['n_fetched'] + n_to_fetch
	n_requests = int(math.ceil(n_to_fetch / int(Config.get("nyt_article")["response_size"])))
	if n_requests == 0:
		n_requests = 1
	prior_cached = len(query.children)
	logging.error(prior_cached)
	prior_offset = int(int(prior_cached) / int(Config.get("nyt_article")["response_size"]))
	logging.error(prior_offset)
	
	req_pars = {
					'query_id': query.id(),
					'functions': [api.make_api_request,cache_response,fetch_comments]
				}
	for i in range(0,n_requests):
		request = {}
		for k,v in req_pars.iteritems():
			request[k] = v
		request['url'] = 'http://api.nytimes.com/svc/search/v1/article?query=text:'+query.doc['query_text'].replace(' ','+')+'+comments:y'
		request['url'] = request['url'] + '&offset='+str(int(prior_offset) + int(i))
		request['url'] = request['url'] + '&fields=body,byline,date,title,url,geo_facet,per_facet,des_facet,org_facet'
		request['url'] = request['url'] + '&api-key='+Config.get('nyt_article')['key']
		
		#logging.critical('BSM[get_old_articles_for_query] Size:'+str(sys.getsizeof(pickle.dumps(request))))
		with voxpop.VPE.beanstalkd_lock:
			voxpop.VPE.get_beanstalkd().use("nytarticle")
			voxpop.VPE.get_beanstalkd().put(pickle.dumps(request), pri=100000)
	query.save()
	return query
	
def cache_response(message={}):
	"""
	Callback function. Is called after a set of results are fetched from the NYT
	API. Is responsible for saving items that have been fetched by the calling
	API request. Is also responsible for either creating, or adding, facet items.
	"""
	logging.info("$$$$ nytArticles.cache_response[]")
	if len(message['json'][u'results']) <= 0:
		return False
	if 'query_id' in message:
		query = voxpop.VPE.get_items().get(_id=message['query_id'])
		query.init_stats = True
	for i in message['json'][u'results']:
		article_id = "article_"+i[u'title'].replace(" ","").replace("\"","").replace("\'","").replace(":","").replace(",","").replace(".","")
		logging.error("$$$$ nytArticles.cache_response.caching_article["+article_id+"]")
		article = voxpop.VPE.get_items().get(_id=article_id)
		if 'kind' in article.doc and article.doc['kind'] == 'article':
			logging.error("$$$$ nytArticles.cache_response.caching_article["+article_id+"].article_already_cached")
			return message
		article.doc['kind'] = 'article'
		if query:
			if 'oldestResult' not in query.doc:
				query.doc['oldestResult'] = int(i[u'date'])
			if int(i[u'date']) < query.doc['oldestResult']:
				query.doc['oldestResult'] = int(i[u'date'])
			if 'newestResult' not in query.doc:
				query.doc['newestResult'] = int(i[u'date'])
			if int(i[u'date']) > query.doc['newestResult']:
				query.doc['newestResult'] = int(i[u'date'])
			query.add_child(article_id)
			article.add_to_cache(query._id)
			query.save()
		if u'des_facet' in i:
			for f in i[u'des_facet']:
				_f = voxpop.VPE.get_items().get(pars={'kind':'des_facet', 'name':f})
				_f.init_stats = True
				_f.add_child(article_id)
				article.add_to_cache(_f._id,False)
		if u'per_facet' in i:
			for f in i[u'per_facet']:
				_f = voxpop.VPE.get_items().get(pars={'kind':'per_facet', 'name':f})
				_f.init_stats = True
				_f.add_child(article_id)
				article.add_to_cache(_f._id,False)
		if u'geo_facet' in i:
			for f in i[u'geo_facet']:
				_f = voxpop.VPE.get_items().get(pars={'kind':'geo_facet', 'name':f})
				_f.init_stats = True
				_f.add_child(article_id)
				article.add_to_cache(_f._id,False)
		if u'org_facet' in i:
			for f in i[u'org_facet']:
				_f = voxpop.VPE.get_items().get(pars={'kind':'org_facet', 'name':f})
				_f.init_stats = True
				_f.add_child(article_id)
				article.add_to_cache(_f._id,False)
		article.update_doc(i)
	return message
	
def fetch_comments(message={}):
	logging.info("$$$$ nytArticles.fetch_comments[]")
	if len(message['json'][u'results']) <= 0:
		return False
	req_pars = 	{
				'functions': [nytCommunity.fetch_comments_for_article_id]
				}
	for i in message['json'][u'results']:
		request = {}
		for k,v in req_pars.iteritems():
			request[k] = v
		request['article_id'] = "article_"+i[u'title'].replace(" ","").replace("\"","").replace("\'","").replace(',','').replace('.','')
		request['article_url'] = i[u'url']
		#logging.critical('BSM[fetch_comments] Size:'+str(sys.getsizeof(pickle.dumps(request))))
		with voxpop.VPE.beanstalkd_lock:
			voxpop.VPE.get_beanstalkd().use("nytcommunity")
			voxpop.VPE.get_beanstalkd().put(pickle.dumps(request), pri=100000)
	return message
