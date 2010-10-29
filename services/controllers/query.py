import logging, os
import voxpop
from controllers.controller import *
import nyt.nytTags as nytTags
import nyt.nytArticle as nytArticle
import nyt.nytCommunity as nytCommunity

class Query(Controller):
	
	def POST(self,_1=None,_2=None):
		logging.info("#### Query")
		if _1 == 'tags' and (_2 != None and _2 != ""):
			return self.post_retrieve_tags_for_query(_2)
		elif _1 == 'tags' and (_2 is None or _2 == ""):
			data = json.loads(web.data())
			if not data['query']:
				return self.json_not_found()
			return self.post_retrieve_tags_for_query(data['query'])
		elif _1 == 'articles' and (_2 != None and _2 != ""):
			return self.post_retrieve_articles_for_query(_2)
		elif _1 == 'articles' and (_2 is None or _2 == ""):
			data = json.loads(web.data())
			if not data['query']:
				return self.json_not_found()
			return self.post_retrieve_articles_for_query(data['query'])
		elif _1 == 'comments' and _2 != None and _2 != "":
			return self.json_not_found()
		return self.json_not_found()
		
	def post_retrieve_tags_for_query(self,query_text):
		logging.info("##### Query.post_retrieve_tags_for_query -> " + query_text)
		query = voxpop.VPE.get_items().get(pars={
			'kind':'timesTags',
			'name':query_text
		})
		request = nytTags.fetch_tags_for_query(query)
		output = {'query':query.doc, 'n_cached':len(query.children)}
		return self.json(output)

	def post_retrieve_articles_for_query(self,query_text):
		logging.info("##### Query.post_retrieve_articles_for_query -> " + query_text)
		query = voxpop.VPE.get_items().get(pars={
			'kind':'articleQuery',
			'name':query_text
		})
		request = nytArticle.fetch_articles_for_query(query_text)
		output = {'query':query.doc, 'n_cached':len(query.children)}
		return self.json(output)
	
	def GET(self,_1=None,_2=None):
		logging.info("#### Query")
		if _1 == 'tags' and _2 != None and _2 != "":
			return self.get_tags_for_query(_2)
		elif _1 == 'articles' and _2 != None and _2 != "":
			return self.get_articles_for_query(_2)
		elif _1 == 'comments' and _2 != None and _2 != "":
			return self.json_not_found()
		return self.json_not_found()
		
	def get_tags_for_query(self,query_text):
		logging.info("##### Query.get_tags_for_query -> " + query_text)
		query = voxpop.VPE.get_items().get(pars={'kind':'timesTags','name':query_text})
		output = {'query':query.doc, 'tags':query.children}
		return self.json(output)
	
	def get_articles_for_query(self,query_text):
		logging.info("##### Query.get_articles_for_query -> " + query_text)
		query = voxpop.VPE.get_items().get(pars={'kind':'articleQuery','name':query_text})
		output = {'query':query.doc, 'tags':query.children}
		return self.json(output)