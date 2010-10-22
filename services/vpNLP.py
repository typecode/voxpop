#!/usr/bin/env python
import logging, os, urllib, sys, threading, cgi, inspect, re, csv
import voxpop
import itemManager, item
import simplejson as json
from lib import couch
import nltk
from nltk import *
from config import *
from util import *

lasswell_dictionary = {}

class LasswellParser():
	
	def __init__(self,lvd_csv='inquireraugmented_osgood.csv'):
		logging.info("#### LasswellParser.__init__[]")
		if len(lasswell_dictionary) == 0:
			logging.error("#### LasswellParser.__init__: DICTIONARY EMPTY")
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
					if word not in lasswell_dictionary:
						lasswell_dictionary[word] = [eva,pot,act]
			logging.critical("#### LasswellParser.__init__: loaded " + str(len(lasswell_dictionary)) + " items")
		
		
	def parse_word(self, word):
		logging.info("#### LasswellParser.parse_word[]")
		word = word.lower()
		if word not in lasswell_dictionary:
			return False
		else:
			return lasswell_dictionary[word]
			
	def parse_paragraph(self, paragraph):
		logging.info("#### LasswellParser.parse_paragraph[]")
		output = {}
		output['tokens'] = nltk.word_tokenize(nltk.clean_html(paragraph))
		output['lasswell_words'] = {'positive':[], 'negative':[], 'strong':[], 'weak':[], 'active':[], 'passive':[]}
		for token in output['tokens']:
			parsed = self.parse_word(token)
			if parsed:
				logging.info(token + str(parsed))
				if parsed[0] == 1:
					output['lasswell_words']['positive'].append(token)
				elif parsed[0] == -1:
					output['lasswell_words']['negative'].append(token)
				if parsed[1] == 1:
					output['lasswell_words']['strong'].append(token)
				elif parsed[1] == -1:
					output['lasswell_words']['weak'].append(token)
				if parsed[2] == 1:
					output['lasswell_words']['active'].append(token)
				elif parsed[2] == -1:
					output['lasswell_words']['passive'].append(token)
		return output
		