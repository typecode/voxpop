import re

def force_unicode(obj, encoding='utf-8'):
	if isinstance(obj, basestring):
		if not isinstance(obj, unicode):
			obj = unicode(obj, encoding)
	return obj
	
def try_unicode(obj):
	try:
	    unicode(obj, "ascii")
	except UnicodeError:
	    return unicode(obj, "utf-8")
	else:
		return obj
	
def strip_html(s):
	p = re.compile(r'<.*?>')
	return p.sub('', s)
	
def strip_quotes(s):
	return s.strip("\"").strip("\'")

def unique(list, idfun=None):
    if idfun is None:
        def idfun(x): return x
    seen = {}
    result = []
    for item in list:
        marker = idfun(item)
        if marker in seen: continue
        seen[marker] = 1
        result.append(item)
    return result