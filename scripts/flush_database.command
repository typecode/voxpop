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
echo ' FLUSHING VOXPOP DATABASE'
echo ' Database: voxpop_dev'
echo ''
echo ''

echo '========VOXPOP DATABASE MAINTENANCE============'
echo 'Deleting existing voxpop_dev'
curl -X DELETE -L "http://localhost:5984/voxpop_dev"
echo 'Creating new voxpop_dev'
curl -X PUT -L "http://localhost:5984/voxpop_dev"
echo 'Replicating voxpop_views to voxpop_dev'
curl -X POST -L "http://localhost:5984/_replicate" -d '{"source":"voxpop_views","target":"voxpop_dev"}'

echo ''
echo ''
echo '========SCRIPT EXITING========================='
echo ''
exit