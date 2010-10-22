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
echo ' FLUSHING VOXPOP RUN DATA'
echo ''
echo ''

#echo '========REMOVING LOG FOLDER================================'
#[ -f '../logs' ] || rm -rf '../logs'
#echo 'Log folder removed'

echo '========REMOVING RUN FOLDER================================'
[ -f '../run' ] || rm -rf '../run'
echo 'Run folder removed'

echo ''
echo ''
echo '========SCRIPT EXITING========================='
echo ''
exit