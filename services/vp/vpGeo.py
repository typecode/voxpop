#!/usr/bin/env python
import logging, os, urllib, sys, threading, cgi, inspect, re, csv
import voxpop
from lib.couch import *
import api
import simplejson as json
from config.config import *

n_added_to_memory = 0
n_fetched_from_memory = 0
n_geocoded = 0

class geocoder():
	
	
	def __init__(self):
		logging.info("#### gMapsGeocoder.__init__[]")
		
	def get_geo_local(self,locationString):
		logging.info("#### gMapsGeocoder.get_geo_local["+locationString+"]")
		_geo = self.getLocalGeocode(locationString)
		if _geo is False:
			return False
		geo_loc = voxpop.VoxPopEnvironment.get_items().get(_id="geo_loc_"+_geo['name'].replace(' ','').replace(',',''))
		if 'kind' in geo_loc.doc:
			return geo_loc
		geo_loc.init_stats = True
		geo_loc.doc = _geo
		geo_loc.doc['kind'] = 'geo_loc'
		geo_loc.save()
		return geo_loc
		
	def get_geo_gmaps(self,locationString):
		logging.error("#### gMapsGeocoder.get_geo_gmaps["+locationString+"]")
		_geo = self.gMapsGeocode(locationString)
		if _geo is False:
			return False
		self.setLocalGeocode(locationString,_geo)
		geo_loc = voxpop.VoxPopEnvironment.get_items().get(_id="geo_loc_"+_geo['name'].replace(' ','').replace(',',''))
		if 'kind' in geo_loc.doc:
			return geo_loc
		geo_loc.init_stats = True
		geo_loc.doc = _geo
		geo_loc.doc['kind'] = 'geo_loc'
		geo_loc.save()
		return geo_loc
	
	def getLocalGeocode(self,locationString):
		logging.info("#### gMapsGeocoder.getLocalGeocode["+locationString+"]")
		try:
			with voxpop.VoxPopEnvironment.db_lock:
				_geo = json.loads(voxpop.VoxPopEnvironment.get_geodb().open_document(locationString))
		except TypeError, ResourceNotFound:
			return False
		if _geo is None:
			return False
		return _geo['geocode']
		
	def setLocalGeocode(self,locationString,_geo):
		logging.info("#### gMapsGeocoder.setLocalGeocode["+locationString+"]")
		_myGeo = {}
		_myGeo['locationstring'] = locationString
		_myGeo['geocode'] = _geo
		try:
			with voxpop.VoxPopEnvironment.db_lock:
				voxpop.VoxPopEnvironment.get_geodb().save_document(_myGeo,locationString)
		except CouchConflict:
			return True
		
	
	def gMapsGeocode(self,locationString):
		logging.info("#### gMapsGeocoder.gMapsGeocode["+locationString+"]")
		request = {}
		request['url'] = 'http://maps.google.com/maps/api/geocode/json?address='+locationString.replace(' ','+')+'&sensor=false'
		logging.info(request['url'])
		_result = api.make_api_request(request)
		_output = {}
		if 'json' in _result:
			if 'status' in _result['json']:
				if _result['json']['status'] == 'OK':
					if 'results' in _result['json']:
						if 'formatted_address' in _result['json']['results'][0]:
							_output['name'] = _result['json']['results'][0]['formatted_address']
						if 'geometry' in _result['json']['results'][0]:
							if 'location' in _result['json']['results'][0]['geometry']:
								_output['latlng'] = _result['json']['results'][0]['geometry']['location']
				else:
					logging.info("#### gMapsGeocoder.geocode FAILED: "+str(_result['json']['status']))
					return False
		return _output
		
	def geocoderUsGeocoder(self,locationString):
		logging.info("#### gMapsGeocoder.geocoderUsGeocoder["+locationString+"]")
		request = {}
		request['url'] = 'http://rpc.geocoder.us/service/csv?address='+locationString.replace(' ','+')
		request['format'] = 'text'
		logging.info(request['url'])
		_result = api.make_api_request(request)
		logging.info(_result)
		_output = _result
		return _output