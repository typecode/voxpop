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
echo 'SNAPSHOTTING VOXPOP'
echo ''
echo ''

timestamp=$(date +%Y%m%d_%H%M)

echo '========DIRECTORY MAINTENANCE=================='
echo 'Checking for /backups folder'
[ -a '../backups' ] || mkdir '../backups'
echo 'Creating timestamped backup folder'
[ -a '../backups/'$timestamp ] || mkdir '../backups/'$timestamp

echo ''
echo '========CREATING SNAPSHOT======================'
echo 'Copying /run folder'
cp -r '../run' '../backups/'$timestamp'/run'
echo 'Copying /logs folder'
cp -r '../logs' '../backups/'$timestamp'/logs'

echo ''
echo 'Snapshot Saved to ../backups/'$timestamp

echo ''
echo ''
echo '========SCRIPT EXITING========================='
echo ''
exit