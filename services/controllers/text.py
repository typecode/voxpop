import logging, os
import voxpop
from controllers.controller import *

class Text(Controller):
	
	def POST(self,_1=None,_2=None):
		logging.info("#### Query")
		if _1 == 'text':
			return self.process_text()
		return self.json_not_found()
		
	def process_text(self,query_text):
		logging.info("##### Text.process_text -> ")
		
		_nlp = vpNLP.LasswellParser().parse_paragraph(comment.doc[u'commentBody'])
		output = {'input':'abc', 'output':_nlp}
		return self.json(output)