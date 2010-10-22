# -*- coding: utf-8 -
#
# Copyright (c) 2008, 2009 Benoit Chesneau <benoitc@e-engura.com> 
#
# Permission to use, copy, modify, and distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

import os

from eventlet.green import socket
from eventlet.green import httplib
from eventlet.pools import Pool
from eventlet.util import wrap_socket_with_coroutine_socket

wrap_socket_with_coroutine_socket()

def make_proxy_connection(uri):
    headers = headers or {}
    proxy = None
    if uri.scheme == 'https':
        proxy = os.environ.get('https_proxy')
    elif uri.scheme == 'http':
        proxy = os.environ.get('http_proxy')

    if not proxy:
        return make_connection(uri, use_proxy=False)
  
    if uri.scheme == 'https':
        proxy_auth = _get_proxy_auth()
        if proxy_auth:
            proxy_auth = 'Proxy-authorization: %s' % proxy_auth
        port = uri.port
        if not port:
            port = 443
        proxy_connect = 'CONNECT %s:%s HTTP/1.0\r\n' % (uri.hostname, port)
        user_agent = 'User-Agent: %s\r\n' % restkit.USER_AGENT
        proxy_pieces = '%s%s%s\r\n' % (proxy_connect, proxy_auth, user_agent)
        proxy_uri = url_parser(proxy)
        if not proxy_uri.port:
            proxy_uri.port = '80'
        # Connect to the proxy server, very simple recv and error checking
        p_sock = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        p_sock.connect((proxy_uri.host, int(proxy_uri.port)))
        p_sock.sendall(proxy_pieces)
        response = ''
        # Wait for the full response.
        while response.find("\r\n\r\n") == -1:
            response += p_sock.recv(8192)
        p_status = response.split()[1]
        if p_status != str(200):
            raise ProxyError('Error status=%s' % str(p_status))
        # Trivial setup for ssl socket.
        ssl = socket.ssl(p_sock, None, None)
        fake_sock = httplib.FakeSocket(p_sock, ssl)
        # Initalize httplib and replace with the proxy socket.
        connection = httplib.HTTPConnection(proxy_uri.host)
        connection.sock=fake_sock
        return connection
    else:
        proxy_uri = url_parser(proxy)
        if not proxy_uri.port:
            proxy_uri.port = '80'
        return httplib.HTTPConnection(proxy_uri.hostname, proxy_uri.port)
    return None
    
def make_connection(uri, use_proxy=True):
    if use_proxy:
        return make_proxy_connection(uri)
    
    if uri.scheme == 'https':
        if not uri.port:
            connection = httplib.HTTPSConnection(uri.hostname)
        else:
            connection = httplib.HTTPSConnection(uri.hostname, uri.port)
    else:
        if not uri.port:
            connection = httplib.HTTPConnection(uri.hostname)
        else:
            connection = httplib.HTTPConnection(uri.hostname, uri.port)
    return connection


class ConnectionPool(Pool):
    def __init__(self, uri, use_proxy=False, min_size=0, max_size=4):
        self.uri = uri
        self.use_proxy = use_proxy
        Pool.__init__(self, min_size, max_size)
    
    def create(self):
        return make_connection(self.uri, self.use_proxy)
           
    def put(self, connection):
        if self.current_size > self.max_size:
            self.current_size -= 1
            # close the connection if needed
            if connection.sock is not None:
                connection.close()
            return

        try:
            response = connection.getresponse()
            response.close()
        except httplib.ResponseNotReady:
            pass
        except:
            connection.close()
            connection = self.create()
            
        if connection.sock is None:
            connection = self.create()
            
        Pool.put(self, connection)