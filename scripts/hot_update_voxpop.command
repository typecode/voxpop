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
echo ' UPDATING VOXPOP'

svn update ../

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