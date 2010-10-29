#!/usr/bin/env python
import os, random, pickle
import logging
import voxpop
import nltk

class vpClassifier():
	
	filename = 'assets/vpClassifierModel.pkl'
	#extract_mode = 'freqDist'
	extract_mode = 'presence'
	
	def __init__(self):
		posdir='assets/movie_txt_sentoken/pos'
		negdir='assets/movie_txt_sentoken/neg'
		logging.error("$$$$ vpClassifier.__init__ No Model Loaded, Training")
		corpus = (
			[(open(posdir+"/"+filename).read(), 'positive')\
				for filename in os.listdir(posdir)] +
			[(open(negdir+"/"+filename).read(), 'negative')\
				for filename in os.listdir(negdir)]
		)
		random.shuffle(corpus)
		train_set = nltk.classify.util.apply_features(self.extract_features, corpus[len(corpus)/2:])
		test_set = nltk.classify.util.apply_features(self.extract_features, corpus[:len(corpus)/2])
		self.classifier = nltk.NaiveBayesClassifier.train(train_set)
		logging.error(nltk.classify.accuracy(self.classifier,test_set))
	
	def extract_features(self,text):
		extract_methods = {
			'freqDist':self.extract_frequency,
			'presence':self.extract_presence
		}
		return extract_methods.get(self.extract_mode)(text)
	
	def extract_frequency(self,text):
		fdist = nltk.probability.FreqDist()
		for word in nltk.word_tokenize(nltk.clean_html(text)):
			fdist.inc(word.lower())
		return fdist
		
	def extract_presence(self,text):
		words = {}
		for word in nltk.word_tokenize(nltk.clean_html(text)):
			if word not in words:
				words[word] = True
		return words
	
	def classify(self,text):
		return self.classifier.classify(self.extract_features(text))
	
	# Save Classifier 
	def save(self): 
		f = open(self.filename, 'w')
		pickle.dump(self.classifier, f)
		f.close()
		
	# Load Classifier
	def load(self):
		return False
		try:
			f = open(self.filename,"r")
		except(IOError):
			logging.error('models not loaded');
			return False
		self.classifier = pickle.load(f)
		f.close()
		return True