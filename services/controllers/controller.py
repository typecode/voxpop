import logging, os, re, threading
import simplejson as json
import lib.typecode.util as util
import voxpop as vp
from config.config import *
from lib import web

class Controller():
	
	def __init__(self):
		logging.info("+++++++++++++++++++++++++++++++++++++++++++++++++++++")
		logging.info("++++++++++++++++ Initting Controller ++++++++++++++++")
		self.db = vp.VPE.get_db()
		
	def render(self,template_name,template_values=None):
		if template_values is None: template_values = {}
		template_values['title'] = '['+Config.get('env')['name']+'] VoxPop v'+str(Config.get('env')['version'])
		path = os.path.dirname(__file__) + '/../templates/'
		renderer = render_jinja(os.path.dirname(__file__) + '/../templates/')
		logging.info("RENDERING: "+str(template_name))
		return renderer[template_name](template_values)
		
	def page_not_found(self):
		return self.text("404")
		
	def json_not_found(self):
		return self.json({"error":"Page not found.","code":"404"})
		
	def redirect(self, url):
		logging.info("##### --> redirecting to " + url)
		return web.SeeOther(url)
		
	def json(self, obj):
		web.header("Content-Type", "application/json")
		out = json.dumps(obj)
		return out.encode('utf-8')
		
	def stream_json(self,obj):
		logging.info("yielding some json")
		yield json.dumps(obj)
		
	def request(self, var):
		try:
			if not web.input():
				return None
		except TypeError, e:
			logging.info("##### --> [%s] POST %s, trying GET string (%s)" % (var, e, web.ctx.query))
			querystring = web.ctx.query[1:]			
			params = dict([part.split('=') for part in querystring.split('&')])	
			try:
				var = params[var]
			except KeyError:
				return None
		else:
			var = web.input()[var] if hasattr(web.input(), var) else None
		if type(var) is str or type(var) is unicode:
			var = util.strip_html(var)
			var = var.strip()
			if len(var) == 0: return None
			var = util.make_unicode(var)
		return var