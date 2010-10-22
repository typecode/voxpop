#!/usr/bin/env bash

cd "`dirname "$0"`"

echo ''
echo ''
echo ''
echo ' __   __   ______     __  __     ______   ______     ______'
echo '/\ \ / /  /\  __ \   /\_\_\_\   /\  == \ /\  __ \   /\  == \'
echo "\ \ \'/   \ \ \/\ \  \/_/\_\/_  \ \  _-/ \ \ \/\ \  \ \  _-/"
echo ' \ \__|    \ \_____\   /\_\/\_\  \ \_\    \ \_____\  \ \_\'
echo '  \/_/      \/_____/   \/_/\/_/   \/_/     \/_____/   \/_/'
echo '   Version 0.2 - 2010 - Andrew Mahon, Zeke Shore'
echo ''
echo ''
echo ' INITIALIZING VOXPOP'
echo ''
echo ''

echo '========DIRECTORY MAINTENANCE=================='
echo 'Creating Log Directory'
[ -a '../logs' ] || mkdir '../logs'
echo 'Creating Run Directory'
[ -a '../run' ] || mkdir '../run'

echo ''
echo '========COUCHDB================================'
[ -a '../run/couchdb' ] || mkdir '../run/couchdb'
echo 'Killing couchdb'
couchdb -A ../conf/couchdb -p ../run/couchdb/run -e ../logs/couchdb.stderr -o ../logs/couchdb.stdout -d
echo 'Starting couchdb'
couchdb -A ../conf/couchdb -p ../run/couchdb/run -e ../logs/couchdb.stderr -o ../logs/couchdb.stdout -b
ps ax | grep beam.ini | grep -v grep | awk '{COUCHDB=$1}'


echo ''
echo '========VOXPOP DATABASE MAINTENANCE============'
sleep 1
echo 'Checking for voxpop_dev'
dev=$(curl -X GET -L "http://localhost:5984/voxpop_dev" | grep -c "not_found")
if [ $dev = "1" ]; then
	echo 'voxpop_dev not found, creating'
	curl -u voxpop:voxpop -X PUT -L "http://localhost:5984/voxpop_dev"
	views=$(curl -X GET -L "http://localhost:5984/voxpop_views" | grep -c "not_found")
	if [ $views = "1" ]; then
		echo 'voxpop_views not found, copying from repository'
		cp '../conf/couchdb/voxpop_views.couch' '../run/couchdb/voxpop_views.couch'
	fi
	echo 'Replicating voxpop_views to voxpop_dev'
	curl -u voxpop:voxpop -X POST -L "http://localhost:5984/_replicate" -d '{"source":"voxpop_views","target":"voxpop_dev"}'
else
	echo 'voxpop_dev found, doing nothing'
fi

echo ''
echo '========GEO DATABASE MAINTENANCE==============='
echo 'Checking for voxpop_geo'
geo=$(curl -X GET -L "http://localhost:5984/voxpop_geo" | grep -c "not_found")
if [ $geo = "1" ]; then
	echo 'voxpop_geo not found'
	echo 'looking for stored voxpop_geo db'
	if [ -a '../conf/couchdb/voxpop_geo.couch' ]; then
		echo 'voxpop_geo conf found, copying'
		cp '../conf/couchdb/voxpop_geo.couch' '../run/couchdb/voxpop_geo.couch'
	else 
		echo 'voxpop_geo conf not found, creating'
		curl -X PUT -L "http://localhost:5984/voxpop_geo"
	fi
else
	echo 'voxpop_geo found, doing nothing'
fi

echo ''
echo '========MEMCACHED=============================='
echo 'Killing memcached'
killall memcached
echo 'Starting memcached'
memcached -d
ps ax | grep memcached | grep -v grep | awk '{MEMCACHED=$1}'

echo ''
echo '========BEANSTALKD============================='
echo 'Killing beanstalkd'
killall beanstalkd
[ -a '../run/beanstalkd' ] || mkdir '../run/beanstalkd'
echo 'Starting beanstalkd'
nohup beanstalkd -f 500 -b "../run/beanstalkd" 2>../logs/beanstalkd.log &
#beanstalkd -d -f 500 -b "../run/beanstalkd"
ps ax | grep beanstalkd | grep -v grep | awk '{BEANSTALKD=$1}'

echo ''
echo '========VOXPOP================================='
echo 'Killing python'
killall python
cd ../services
echo 'Starting python'
nohup python vp_producer.py 2> ../logs/vp_producer.log &
nohup python vp_workers.py 2> ../logs/vp_workers.log &

echo ''
echo ''
echo '========SCRIPT EXITING========================='
echo ''
exit