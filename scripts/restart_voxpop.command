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
echo ' RESTARTING VOXPOP'
echo ''

echo '========SHUTDOWN=============================='
echo 'Killing memcached'
killall memcached
echo 'Killing beanstalkd'
killall beanstalkd
echo 'Killing python'
killall python

sleep 1

echo ''
echo '========MEMCACHED=============================='
echo 'Starting memcached'
memcached -d
ps ax | grep memcached | grep -v grep | awk '{MEMCACHED=$1}'

echo ''
echo '========BEANSTALKD============================='
[ -a '../run/beanstalkd' ] || mkdir '../run/beanstalkd'
echo 'Starting beanstalkd'
beanstalkd -d -f 500 -b "../run/beanstalkd"
ps ax | grep beanstalkd | grep -v grep | awk '{BEANSTALKD=$1}'

echo ''
echo '========VOXPOP================================='
cd ../services
echo 'Removing Precompiled .py Files'
find . -name "*.pyc" -exec rm -rf {} \;
echo 'Starting python'
nohup python vp_producer.py 2> ../logs/vp_producer.log &
nohup python vp_workers.py 2> ../logs/vp_workers.log &

echo ''
echo ''
echo '========SCRIPT EXITING========================='
echo ''
exit