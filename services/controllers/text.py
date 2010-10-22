import logging, os
import voxpop
from controllers.controller import *
import vp.vpNLP

class Text(Controller):
	
	def POST(self,_1=None,_2=None):
		logging.info("#### Query")
		return self.process_text()
		
	def process_text(self):
		logging.info("##### Text.process_text -> ")
		
		data = json.loads(web.data())
		
		if not data['text']:
			return self.json({'message':'No Text Provided To Process.'})
		
		_nlp = vpNLP.LasswellParser().parse_paragraph(data['text'])
		output = {'input':data['text'], 'output':_nlp}
		return self.json(output)