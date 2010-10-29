#! /usr/bin/python2.4
import logging, httplib, socket, sys, time, types
from lib import httplib2
from lib import restkit
from lib.restkit.httpc import *
from lib.restkit.pool import *
from urllib import quote, urlencode
import simplejson as json
import socket


USER_AGENT = 'voxpop/0.0.0.0'
class Couch:

    def __init__(self, host, port=5984, options=None, cache=None, timeout=200):
        logging.info("#### Couch.__init__["+str(host)+", "+str(port)+", "+str(options)+", "+str(cache)+", "+str(timeout)+"]")
        http = httplib2.Http(cache=cache, timeout=200)
        http.force_exception_to_status_code = False
        self.resource = Resource(uri=host,transport=http)
        self.host = host
        self.port = port
        self.db_name = None
        self.headers = {'Accept':'application/json','User-Agent': USER_AGENT}

    def __call__(self):
        logging.info("!!!! Couch.__call__: not yet implemented")

    def __getitem__(self,item):
        logging.info("!!!! Couch.__getitem__: not yet implemented")

    def __contains__(self,name):
        logging.info("#### Couch.__contains__["+str(name)+"]")
        headers = self.headers
        try:
            self.resource.head(self.host, ''.join(['/', self.db_name, '/', name,]), headers)
            return True
        except restkit.ResourceNotFound:
            return False

    def connected_to(self):
        logging.info("#### Couch.connected_to[]")
        return self.db_name

    def open_database(self,db_name):
        logging.info("#### Couch.open_database["+str(db_name)+"]")
        self.db_name = db_name

    def create_database(self, db_name):
        logging.info("#### Couch.create_database["+str(db_name)+"]")
        headers = self.headers
        return json.loads(self.resource.put(self.host, ''.join(['/',str(db_name),'/']), "", headers))

    def delete_database(self, db_name):
        logging.info("#### Couch.delete_database["+str(db_name)+"]")
        headers = self.headers
        return json.loads(self.resource.delete(self.host, ''.join(['/',str(db_name),'/']), headers))

    def list_databases(self):
        logging.info("#### Couch.list_databases[]")
        headers = self.headers
        return json.loads(self.resource.get(self.host, '/_all_dbs', headers))

    def database_info(self, db_name):
        logging.info("#### Couch.database_info["+db_name+"]")
        headers = self.headers
        return json.loads(self.resource.get(self.host, ''.join(['/', db_name, '/']), headers))

    # Document operations

    def has_document(self,doc_id):
        logging.info("#### Couch.has_document["+doc_id+"]")
        headers = self.headers
        try:
            r = json.loads(self.resource.head(self.host, ''.join(['/', self.db_name, '/', doc_id,]), headers))
        except restkit.ResourceNotFound:
            logging.error("**** Couch.has_document: Document Not Found!")

    def list_documents(self, db_name):
        logging.info("#### Couch.list_documents["+db_name+"]")
        headers = self.headers
        return json.loads(self.resource.get(self.host, ''.join(['/', self.db_name, '/', '_all_docs']), headers))

    def open_document(self, doc_id, **params):
        logging.info("#### Couch.open_document["+doc_id+"]")
        headers = self.headers
        couchd = None
        try:
            couchd = self.resource.get(self.host, ''.join(['/', self.db_name, '/', doc_id,]), headers, **params)
        except restkit.ResourceNotFound:
            couchd = None
        return couchd

    def save_document(self, body, doc_id=None):
        logging.info("#### Couch.save_document["+doc_id+"]")
        r = 0
        headers = {'Accept':'application/json', 'User-Agent': USER_AGENT}
        if body is not None:
            if not hasattr(body, 'read') and not isinstance(body, basestring):
                body = json.dumps(body).encode('utf-8')
                headers.setdefault('Content-Type', 'application/json')
        if doc_id:
            try:
                r = self.resource.put(self.host, ''.join(['/', self.db_name, '/', doc_id]), body, headers)
            except restkit.RequestFailed,e:
                if json.loads(e._get_message())['error'] == 'conflict':
                    raise CouchConflict
        else:
            r = self.resource.post(self.host, ''.join(['/', self.db_name, '/']), body, headers)
        return r

    def bulk_save_documents(self, documents=None):
        logging.info("#### Couch.bulk_save_documents[]")
        headers = {'Accept':'application/json', 'User-Agent': USER_AGENT}
        body = ""
        if len(documents) == 0:
            logging.error('#### Couch.bulk_save_documents: NO DOCUMENTS PROVIDED TO SAVE')
            return False
        if documents is not None:
            if not hasattr(documents, 'read') and not isinstance(documents, basestring):
                body = json.dumps({'docs':documents}).encode('utf-8')
                headers.setdefault('Content-Type', 'application/json')
        try:
            r = self.resource.post(self.host, ''.join(['/', self.db_name, '/_bulk_docs']), body, headers)
            return json.loads(r)
        except restkit.RequestFailed,e:
            logging.error(e._get_message())

    def delete_document(self, db_name, doc_id):
        logging.info("#### Couch.delete_document["+db_name+", "+doc_id+"]")
        headers = self.headers
        # XXX Crashed if resource is non-existent; not so for DELETE on db. Bug?
        # XXX Does not work any more, on has to specify an revid 
        #     Either do html head to get the recten revid or provide it as parameter
        return json.loads(self.resource.delete(self.host, ''.join(['/', dbName, '/', docId]), headers))

#This is from couchdbkit, modified by andrew mahon

class Resource(restkit.RestClient):

    def __init__(self, uri="http://127.0.0.1:5984", transport=httplib2, use_proxy=False, min_size=0, max_size=1, pool_class=None, **kwargs):
        logging.info("#### Couch.Resource.__init__[]")
        restkit.RestClient.__init__(self, transport=transport, headers=None, follow_redirect=True, force_follow_redirect=False, use_proxy=False, min_size=0, max_size=4, pool_class=ConnectionPool)

    def encode_params(self, params):
        _params = {}
        if params:
            for name, value in params.items():
                if name in ('key', 'startkey', 'endkey') \
                        or not isinstance(value, basestring):
                    value = json.dumps(value)
                _params[name] = value
        return _params

class CouchConflict(Exception):
	pass