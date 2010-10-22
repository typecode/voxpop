#!/usr/bin/env python
import logging, os, urllib, sys, threading, cgi, inspect, re, csv, copy, types
import voxpop
import item
import itemManager
import simplejson as json
from nltk import *
from config.config import *

def get_stats_for_items(items):
	logging.info("#### vpStats --> get_stats_for_items[]")
	_myStats = {}
	for i in items:
		_item = voxpop.VoxPopEnvironment.get_items().get(_id=i).doc
		if 'stats' in _item:
			if 'counts' in _item['stats']:
				if 'counts' not in _myStats:
					_myStats['counts'] = {}
				for j in _item['stats']['counts']:
					if j not in _myStats['counts']:
						_myStats['counts'][j] = _item['stats']['counts'][j]
					else:
						_myStats['counts'][j] = _myStats['counts'][j] + _item['stats']['counts'][j]
			if 'facets' in _item['stats']:
				if 'facets' not in _myStats:
					_myStats['facets'] = {}
				for j in _item['stats']['facets']:
					if j not in _myStats['facets']:
						_myStats['facets'][j] = FreqDist(_item['stats']['facets'][j])
					else:
						if isinstance(_item['stats']['facets'][j], FreqDist):
							_myStats['facets'][j] = FreqDist(_myStats['facets'][j].samples() + _item['stats']['facets'][j].samples())
			if 'nlp' in _item['stats']:
				if 'nlp' not in _myStats:
					_myStats['nlp'] = {}
				if 'lasswell_words' not in _myStats['nlp']:
					_myStats['nlp']['lasswell_words'] = {}
				for j in _item['stats']['nlp']['lasswell_words']:
					if j.find('n_') == -1:
						if j not in _myStats['nlp']['lasswell_words']:
							_myStats['nlp']['lasswell_words'][j] = _item['stats']['nlp']['lasswell_words'][j]
						else:
							if isinstance(_item['stats']['nlp']['lasswell_words'][j], FreqDist):
								_myStats['nlp']['lasswell_words'][j] = FreqDist(_myStats['nlp']['lasswell_words'][j].samples() + _item['stats']['nlp']['lasswell_words'][j].samples())
						if isinstance(_myStats['nlp']['lasswell_words'][j], FreqDist):
							_myStats['nlp']['lasswell_words']['n_'+j] = len(_myStats['nlp']['lasswell_words'][j].samples())
						else:
							_myStats['nlp']['lasswell_words']['n_'+j] = len(_myStats['nlp']['lasswell_words'][j])
	return _myStats

class vpStats():
	
	def __init__(self,_item):
		logging.info("#### vpStats.__init__[]")
		self.item = _item
	
	def update(self,_stats,**kwargs):
		if 'stats' not in self.item.doc:
			self.item.doc['stats'] = _stats
		if 'dest' in kwargs:
			_myStats = copy.copy(kwargs['dest'])
			logging.info("#### vpStats.update: ["+self.item._id+"] ["+str(_stats)+"]")
		else:
			if 'stats' not in self.item.doc:
				self.item.doc['stats'] = {}
			_myStats = copy.copy(self.item.doc['stats'])
			logging.info("#### vpStats.update: ["+self.item._id+"] ["+str(_stats)+"]")
		if 'counts' in _stats:
			if 'counts' not in _myStats:
				_myStats['counts'] = {}
			for j in _stats['counts']:
				if j not in _myStats['counts']:
					_myStats['counts'][j] = _stats['counts'][j]
				else:
					_myStats['counts'][j] = _myStats['counts'][j] + _stats['counts'][j]
		if 'facets' in _stats:
			if 'facets' not in _myStats:
				_myStats['facets'] = {}
			for j in _stats['facets']:
				if j not in _myStats['facets']:
					_myStats['facets'][j] = FreqDist(_stats['facets'][j])
				else:
					if isinstance(_stats['facets'][j], FreqDist):
						_myStats['facets'][j] = FreqDist(_myStats['facets'][j].samples() + _stats['facets'][j].samples())
		if 'nlp' in _stats:
			if 'nlp' not in _myStats:
				_myStats['nlp'] = {}
			if 'lasswell_words' not in _myStats['nlp']:
				_myStats['nlp']['lasswell_words'] = {}
			for j in _stats['nlp']['lasswell_words']:
				if j.find('n_') == -1:
					if j not in _myStats['nlp']['lasswell_words']:
						_myStats['nlp']['lasswell_words'][j] = _stats['nlp']['lasswell_words'][j]
					else:
						if isinstance(_stats['nlp']['lasswell_words'][j], FreqDist):
							_myStats['nlp']['lasswell_words'][j] = FreqDist(_myStats['nlp']['lasswell_words'][j].samples() + _stats['nlp']['lasswell_words'][j].samples())
					if isinstance(_myStats['nlp']['lasswell_words'][j], FreqDist):
						_myStats['nlp']['lasswell_words']['n_'+j] = len(_myStats['nlp']['lasswell_words'][j].samples())
					else:
						_myStats['nlp']['lasswell_words']['n_'+j] = len(_myStats['nlp']['lasswell_words'][j])
		if 'dest' in kwargs:
			return _myStats
		self.item.doc['stats'] = _myStats
		self.item.save()
		del _myStats
		return self.item.doc['stats']
	
	def get(self):
		logging.info("#### vpStats.get: ["+ self.item._id+"]")
		if 'stats' not in self.item.doc:
			self.item.doc['stats'] = None
		return self.item.doc['stats']
	
	def run(self,callback=None):
		logging.critical("#### vpStats.run: ["+ self.item._id+"]")
		if 'stats' in self.item.doc:
			del self.item.doc['stats']
		_counts = self.count_children()
		_facets = self.related_facets()
		_nlp = self.aggregate_NLP()
		_myStats = {'counts':_counts, 'facets':_facets, 'nlp':_nlp}
		_i = 0
		if len(self.item.children) == 0:
			logging.info("#### vpStats.run:["+ self.item._id+"] _NO CHILDREN TO RUN")
			self.item.doc['stats'] = _myStats
			self.item.save()
			if callback and isinstance(callback, types.FunctionType):
				callback(self.item.doc['stats'])
		else:
			for i in self.item.children:
				_i  = _i + 1
				_myItem = voxpop.VoxPopEnvironment.get_items()[i]
				if _myItem is not None:
					_myMyStats = _myItem.stats.get()
					if _myMyStats is None:
						def _update(_stats):
							logging.info("#### vpStats.run:["+ self.item._id+"] _UPDATE")
							self.update(_stats,dest=_myStats)
						_myItem.stats.run(_update)
					else:
						self.update(_myMyStats,dest=_myStats)
				if _i == len(self.item.children):
					logging.info("#### vpStats.run:["+ self.item._id+"] _FINISHED RUNNING CHILDREN")
					self.item.doc['stats'] = _myStats
					self.item.save()
					if callback and isinstance(callback, types.FunctionType):
						callback(self.item.doc['stats'])
			
		
	def count_children(self):
		logging.info("#### vpStats.count_children: ["+self.item._id+"]")
		_children = {}
		_doc = self.item.doc
		if 'kind' in _doc:
			_children[_doc['kind']] = 1
		return _children
		
	def related_facets(self):
		logging.info("#### vpStats.related_facets: ["+self.item._id+"]")
		_facets = {'des':FreqDist(),'geo':FreqDist(),'per':FreqDist(),'org':FreqDist()}
		_doc = self.item.doc
		if 'des_facet' in _doc:
			for i in _doc['des_facet']:
				_facets['des'].inc(i)
		if 'geo_facet' in _doc:
			for i in _doc['geo_facet']:
				_facets['geo'].inc(i)
		if 'per_facet' in _doc:
			for i in _doc['per_facet']:
				_facets['per'].inc(i)
		if 'org_facet' in _doc:
			for i in _doc['org_facet']:
				_facets['org'].inc(i)
		return _facets
		
	def aggregate_NLP(self):
		logging.info("#### vpStats.aggregate_NLP: "+ self.item._id)
		_aggregate_NLP = {'lasswell_words':{}}
		_doc = self.item.doc
		if 'NLP' in _doc:
			if 'lasswell_words' in _doc['NLP']:
				for i in _doc['NLP']['lasswell_words']:
					if i not in _aggregate_NLP['lasswell_words']:
						_aggregate_NLP['lasswell_words'][i] = FreqDist()
					for j in _doc['NLP']['lasswell_words'][i]:
						_aggregate_NLP['lasswell_words'][i].inc(j)
					_aggregate_NLP['lasswell_words']['n_'+i] = len(_aggregate_NLP['lasswell_words'][i])
					
		return _aggregate_NLP