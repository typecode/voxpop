import logging, os
import voxpop
from controllers.controller import *
from vp import vpNLP
from vp.vpClassifier import vpClassifier

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
		_class = voxpop.VPE.get_classifier().classify(data['text'])
		
		output = {
			'input':data['text'],
			'output':_nlp,
			'bayesclass':_class
		}
		
		return self.json(output)