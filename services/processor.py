#!/usr/bin/env python
import logging, os, urllib, sys, threading, cgi, inspect, re, csv
import voxpop
import caches
import cache
import simplejson as json
from lib import couch
from lib import nltk
from nltk import *
from config.config import *
from util import *

#lv = [-1,0,1]

class WordnetParser():
	
	good_bad_distance = nltk.corpus.wordnet.synset('good.a.01').shortest_path_distance(nltk.corpus.wordnet.synset('bad.a.01'))
	strong_weak_distance = nltk.corpus.wordnet.synset('strong.a.01').shortest_path_distance(nltk.corpus.wordnet.synset('weak.a.01'))
	active_passive_distance = nltk.corpus.wordnet.synset('active.a.01').shortest_path_distance(nltk.corpus.wordnet.synset('passive.a.01'))
	
	def __init__(self):
		logging.info("#### WordnetParser.__init__[]")
		
	def parse(self, text):
		adjectives = []
		for w,pos in nltk.pos_tag(nltk.word_tokenize(nltk.clean_html(text))):
			if pos == "JJ":
				adjectives.append([w,evaluative(w),potency(w),activity(w)])
		return adjectives
		
	def evaluative(self,word):
		logging.info("$$$$ WordnetParser.evaluative["+str(word)+"]")
		a_synsets = []
		for s in nltk.corpus.wordnet.synsets(word, nltk.corpus.wordnet.ADJ):
			if s.pos == "a":
				a_synsets.append(s)
		if len(a_synsets) > 0:
			_good = 0
			_bad = 0
			for s in a_synsets:
				for b in nltk.corpus.wordnet.synsets('bad'):
					if s.pos == b.pos and s != b:
						_b = s.lch_similarity(b)
						_bad += _b
				for g in nltk.corpus.wordnet.synsets('good'):
					if s.pos == g.pos and s != g:
						_g = s.lch_similarity(g)
						_good += _g
			_good = _good/len(a_synsets)
			_bad = _bad/len(a_synsets)
			return (_bad - _good) / good_bad_distance
		else:
			return 0

	def potency(self,word):
		logging.info("$$$$ WordnetParser.potency["+str(word)+"]")
		first_adj = None
		for s in nltk.corpus.wordnet.synsets(word, nltk.corpus.wordnet.ADJ):
			if s.pos == "a" and first_adj is None:
				first_adj = s
		if first_adj is not None:
			return (first_adj.shortest_path_distance(nltk.corpus.wordnet.synset('weak.a.01')) - first_adj.shortest_path_distance(nltk.corpus.wordnet.synset('strong.a.01'))) / strong_weak_distance
		else:
			return 0

	def activity(self,word):
		logging.info("$$$$ WordnetParser.activity["+str(word)+"]")
		first_adj = None
		for s in nltk.corpus.wordnet.synsets(word, nltk.corpus.wordnet.ADJ):
			if s.pos == "a" and first_adj is None:
				first_adj = s
		if first_adj is not None:
			return (first_adj.shortest_path_distance(nltk.corpus.wordnet.synset('passive.a.01')) - first_adj.shortest_path_distance(nltk.corpus.wordnet.synset('active.a.01'))) / active_passive_distance
		else:
			return 0

class LasswellParser():
	
	dictionary = {}
	
	def __init__(self,lvd_csv='inquireraugmented_osgood.csv'):
		logging.critical("#### LasswellParser.__init__[]")
		lvd_csv_file = open(lvd_csv,'U')
		dialect = csv.Sniffer().sniff(lvd_csv_file.read(1024))
		lvd_csv_file.seek(0)
		lvl = csv.reader(lvd_csv_file, dialect)
		for row in lvl:
			eva = 0
			if len(row[2]) > 0 or len(row[4]) > 0:
				eva = 1
			elif len(row[3]) > 0 or len(row[5]) > 0:
				eva = -1
			
			pot = 0
			if len(row[6]) > 0:
				pot = 1
			elif len(row[7]) > 0:
				pot = -1
				
			act = 0
			if len(row[8]) > 0:
				act = 1
			elif len(row[9]) > 0:
				act = -1
				
			if eva != 0 or pot != 0 or act != 0:
				hash_pos = row[0].find("#")
				if hash_pos >= 0:
					word = row[0][:hash_pos].lower()
				else:
					word = row[0].lower()
				if word not in self.dictionary:
					self.dictionary[word] = [eva,pot,act]
				
		logging.critical("#### LasswellParser.__init__: loaded " + str(len(self.dictionary)) + " items")
		
		
	def parse(self, word):
		word = word.lower()
		if word not in self.dictionary:
			return False
		else:
			return self.dictionary[word]

lasswell_lock = threading.Lock()
lp = LasswellParser()

def process_comment(data,**kwargs):
	logging.info("$$$$ nlp.process_comment[]")
	cache = voxpop.VoxPopEnvironment.get_caches().get(key=data['cache_id'])
	try:
		comment = cache.get_cached()[data['comment_id']]
	except KeyError:
		logging.info("$$$$ nlp.process_comment: ITEM NOT FOUND IN MEMORY ["+data['comment_id']+"]")
		return False
	tokens = nltk.word_tokenize(nltk.clean_html(comment['commentBody']))
	words = {'positive':[], 'negative':[], 'strong':[], 'weak':[], 'active':[], 'passive':[]}
	for token in tokens:
		with lasswell_lock:
			parsed = lp.parse(token)
		if parsed:
			logging.info(token + str(parsed))
			if parsed[0] == 1:
				words['positive'].append(token)
			elif parsed[0] == -1:
				words['negative'].append(token)
			if parsed[1] == 1:
				words['strong'].append(token)
			elif parsed[1] == -1:
				words['weak'].append(token)
			if parsed[2] == 1:
				words['active'].append(token)
			elif parsed[2] == -1:
				words['passive'].append(token)
	comment['words'] = words
	cache.set(data['comment_id'], comment)
	return True

