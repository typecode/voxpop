{
   "_id": "_design/caches",
   "_rev": "5-511afb727fe76bd5472dbe8d47784369",
   "language": "javascript",
   "views": {
       "get_items_for_key": {
           "map": "function(doc) {\u000a   if (doc.caches) {\u000a    for(var i in doc.caches){\u000a     emit(doc.caches[i],doc._id);\u000a    }\u000a   } else if (doc.type == 'cache'){\u000a    if(doc.date){\u000a     emit([doc._id,doc.date],doc);\u000a    }\u000a   }\u000a}"
       },
       "list": {
           "map": "function(doc) {\u000a   if (doc.caches) {\u000a    for(var i = 0; i < doc.caches.length; i++){\u000a     emit(doc.caches[i],1);\u000a    }\u000a   }\u000a}",
           "reduce": "function (key, values, rereduce) {\u000a    return sum(values);\u000a}"
       },
       "total": {
           "map": "function(doc) {\u000a if(doc.type == 'cache'){\u000a  emit('cache',1);\u000a }\u000a}",
           "reduce": "function (key, values, rereduce) {\u000a    return sum(values);\u000a}"
       }
   }
}

{
   "_id": "_design/comments",
   "_rev": "7-64f69eba986f14f07283a34e1c8c1f9f",
   "language": "javascript",
   "views": {
       "by_article": {
           "map": "function(doc) {\u000a if(doc.type && doc.kind){\u000a  if (doc.type == 'cached' && doc.kind == 'comment') {\u000a   if(doc.article){\u000a    emit(doc.article,doc._id);\u000a   }\u000a  }\u000a }\u000a}"
       }
   }
}

{
   "_id": "_design/db",
   "_rev": "2-f5149284db6d370318e126f600fd0581",
   "language": "javascript",
   "views": {
       "kinds": {
           "map": "function(doc) {\u000a if(doc.kind){\u000a  emit(doc.kind, 1);\u000a }\u000a}",
           "reduce": "function (key, values, rereduce) {\u000a    return sum(values);\u000a}"
       }
   }
}

{
   "_id": "_design/topics",
   "_rev": "2-300dc751e15ab661401e498a1d45d152",
   "language": "javascript",
   "views": {
       "list": {
           "map": "function(doc) {\u000a if(doc.type){\u000a  if(doc.type == \"cache\"){\u000a   if(doc.kind){\u000a    if(doc.kind == \"topic\"){\u000a     if(doc.topic){\u000a      emit(doc.topic, 1);\u000a     }\u000a    }\u000a   }\u000a  }\u000a }\u000a}",
           "reduce": "function (key, values, rereduce) {\u000a    return sum(values);\u000a}"
       }
   }
}