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
echo ' STOPPING VOXPOP'
echo ''
echo ''

echo '========COUCHDB================================'
echo 'Killing couchdb'
couchdb -a ../conf/couchdb.ini -p ../run/couchdb/run -e ../logs/couchdb.stderr -o ../logs/couchdb.stdout -d

echo ''
echo '========MEMCACHED=============================='
echo 'Killing memcached'
killall memcached

echo ''
echo '========BEANSTALKD============================='
echo 'Killing beanstalkd'
killall beanstalkd

echo ''
echo '========VOXPOP================================='
echo 'Killing python'
killall python

echo ''
echo ''
echo '========SCRIPT EXITING========================='
echo ''
exit