import logging
import threading
import urllib2
from lib.beautifulsoup.BeautifulSoup import BeautifulSoup

import voxpop
import nytArticle

class nytScraper():
	"""
	Scrapes NYT TimesTopics Page for list of top topics for a given week. Scraper
	runs on an interval.
	"""
	
	interval = 604800 #one week in seconds
	
	def __init__(self):
		"""
		Initializes nytScraper.
		"""
		self.fetch_topics()
		#self.start_interval()
	
	def start_interval(self):
		"""
		Starts scraper interval. Used to repeat the scraping action on a 
		given interval.
		"""
		self.interval = threading.Timer(self.interval,self.fetch_topics)
		self.interval.start()
		
	def fetch_topics(self):
		"""
		Fetches a list of the top topics of discussion on nyt.com
		"""
		url = "http://topics.nytimes.com/topics/reference/timestopics/index.html"
		f = urllib2.urlopen(url)
		soup = BeautifulSoup(f.read())
		for i in soup.html.body\
			.find('div',{'class':'aColumn'})\
			.find('div',{'class':'columnGroupborderTop'}).findAll('a'):
			if i.string is not None:
				query = voxpop.VPE.get_items().get(pars={
					'kind':'articles',
					'name':i.string
				})
				request = nytArticle.fetch_articles_for_times_topic(i.string)
		self.start_interval()