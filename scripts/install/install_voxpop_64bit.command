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
echo ' INSTALLING VOXPOP for 64BIT'
echo '  This software is designed for installation on'
echo '  Ubuntu 9.4 Server.'
echo ''
echo ''

echo '========CHECKING FOR PREREQUISITES============'
if [ -f /usr/bin/python ]
then
	echo 'python exists'
fi

echo ''
echo ''
echo '========CREATING VOXPOP USER============'
sudo adduser --system  --shell /bin/bash --group --gecos 'VoxPop v0.2' voxpop
echo 'Select a password for your VoxPop user.'
sudo passwd voxpop

echo ''
echo ''
echo '========CREATING VOXPOP_INSTALL FOLDER============'
mkdir voxpop_install
cd voxpop_install
mkdir src

echo ''
echo ''
echo '========UPDATING APT-GET============'
sudo apt-get update
sudo apt-get -y upgrade

echo ''
echo ''
echo '========Installing Subversion============'
sudo apt-get -fy install subversion

echo ''
echo ''
echo '========FETCHING VOXPOP_INSTALL FILES============'
svn checkout http://voxpoptc.googlecode.com/svn/install ./

echo ''
echo ''
echo '========INSTALLING Python Utilities============'
echo 'Installing python-dev'
sudo apt-get -fy install python-dev
echo 'Installing python-setuptools'
sudo apt-get -fy install python-setuptools
echo 'Installing PyYAML'
cd src
curl -O http://pyyaml.org/download/pyyaml/PyYAML-3.09.tar.gz
tar xvzf PyYAML-3.09.tar.gz
cd PyYAML-3.09
sudo python setup.py install
cd ../../

echo ''
echo ''
echo '========INSTALLING NumPy============'
sudo apt-get -fy install python-numpy

echo ''
echo ''
echo '========INSTALLING NLTK============'
cd src
svn checkout http://nltk.googlecode.com/svn/trunk/nltk nltk_trunk
#curl -O http://nltk.googlecode.com/files/nltk-2.0b8.tar.gz
#tar xvzf nltk-2.0b8.tar.gz
#cd nltk-2.0b8
cd nltk_trunk
sudo python setup-distutils.py install
cd ../../

echo ''
echo ''
echo '========DOWNLOADING NLTK DATA============'
echo 'Please enter the password for your VoxPop user.'
#su voxpop -c "python -c 'import nltk; nltk.download(\"all-corpora\");'"
sudo python -c 'import nltk; nltk.download(\"all-corpora\");'

echo ''
echo ''
echo '========INSTALLING Apache2============'
sudo apt-get -fy install apache2

echo 'Apache2 Installed, Opening Additional Ports'
sudo cp -f conf/apache2/ports.conf /etc/apache2/ports.conf

if [ ! -f /etc/apache2/sites-available/voxpop ]
then
	echo 'VoxPop Apache HTTPD File Does Not Exist, Copying'
	sudo cp conf/apache2/voxpop /etc/apache2/sites-available/voxpop
fi
if [ ! -f /etc/apache2/sites-available/collectd ]
then
	echo 'Collectd Apache HTTPD File Does Not Exist, Copying'
	sudo cp conf/apache2/collectd /etc/apache2/sites-available/collectd
fi
if [ ! -f /var/www/collectd ]
then
	echo 'Creating Collected WWW Dir'
	sudo mkdir /var/www/collectd
fi
sudo a2dissite 000-default
sudo a2ensite voxpop
sudo a2ensite collectd

echo 'Enabling Apache2 Mods'
sudo a2enmod proxy
sudo a2enmod proxy_http

echo ''
echo ''
echo '========INSTALLING PHP5============'
sudo apt-get -fy install libapache2-mod-php5 php5 php5-common php5-curl php5-dev php5-gd php5-imagick php5-mcrypt php5-memcache php5-mhash php5-mysql php5-pspell php5-snmp php5-sqlite php5-xmlrpc php5-xsl
sudo a2enmod php5

echo ''
echo ''
echo '========INSTALLING CouchDB============'
echo 'Installing CouchDB dependencies'
sudo apt-get -fy install erlang libmozjs-dev libicu-dev libcurl4-gnutls-dev make automake autoconf libtool help2man
echo 'Installing CouchDB'
cd src
svn checkout http://svn.apache.org/repos/asf/couchdb/tags/0.11.0/ couchdb
cd couchdb
./bootstrap
./configure
make
sudo make install
cd ../../

echo ''
echo ''
echo '========INSTALLING LibEvent============'
cd src
curl -O http://monkey.org/~provos/libevent-1.4.13-stable.tar.gz
tar xvzf libevent-1.4.13-stable.tar.gz
cd libevent-1.4.13-stable
./configure
make
sudo make install
echo 'Creating LibEvent Linkage'
sudo sh -c "echo '/usr/local/lib/' > /etc/ld.so.conf.d/libevent-i386.conf"
sudo ldconfig
cd ../../


echo ''
echo ''
echo '========INSTALLING Beanstalkd============'
cd src
curl -O http://xph.us/dist/beanstalkd/beanstalkd-1.4.4.tar.gz
tar xvzf beanstalkd-1.4.4.tar.gz
cd beanstalkd-1.4.4
./configure
make
sudo make install
sudo adduser --system  --shell /bin/bash --group --gecos 'Beanstalkd account' beanstalkd
cd ../../

echo ''
echo ''
echo '========INSTALLING Memcached============'
cd src
curl -O http://memcached.googlecode.com/files/memcached-1.4.5.tar.gz
tar xvzf memcached-1.4.5.tar.gz
cd memcached-1.4.5
./configure -with-libevent=/usr/local/lib/
make
sudo make install
sudo adduser --system  --shell /bin/bash --group --gecos 'Memcached account' memcached
cd ../../

echo ''
echo ''
echo '========INSTALLING Git============'
sudo apt-get -fy install git-core

echo ''
echo ''
echo '========INSTALLING Python Libraries============'
echo 'Installing Restkit'
cd src
git clone git://github.com/benoitc/restkit.git
cd restkit
sudo python setup.py install
cd ../../

echo ''
echo ''
echo '========INSTALLING cMake & Ruby & RubyGem============'
sudo apt-get -fy install cmake ruby ruby-dev libyaml-ruby libzlib-ruby rubygems rubygems1.9.1 irb

echo ''
echo ''
echo '========INSTALLING Collectd============'
echo 'Installing Collectd Plugin Prerequisites'
echo 'Installing librrd4'
sudo apt-get -fy install librrd4 librrd-dev
echo ''
echo 'Installing YAJL'
cd src
git clone git://github.com/lloyd/yajl.git
cd yajl
./configure
sudo make install
cd ../

echo ''
echo 'Installing Beanstalkd-Client'
sudo gem install beanstalk-client

echo ''
echo 'Installing Collectd'
curl -O http://collectd.org/files/collectd-4.10.0.tar.gz
tar xvzf collectd-4.10.0.tar.gz
cd collectd-4.10.0
./configure
make all
sudo make install
cd ../../

echo ''
echo 'Copying Collectd .conf file'
sudo cp conf/collectd/collectd.conf /opt/collectd/etc/collectd.conf
echo 'Copying Collectd PERL Bindings'
sudo cp -R /opt/collectd/share/perl/5.10.0/Collectd /usr/lib/perl/5.10.0/
sudo cp /opt/collectd/share/perl/5.10.0/Collectd.pm /usr/lib/perl/5.10.0/Collectd.pm
echo 'Restarting collectd'
sudo /opt/collectd/sbin/collectd


echo ''
echo ''
echo '========INSTALLING Collection3, Collectd Frontend============'
echo 'Copying Collected3 to WWW home'
sudo cp -r src/collectd-4.10.0/contrib/collection3/* /var/www/collectd/
echo ''
echo 'Installing Collected3 PreReqs'
sudo apt-get -fy install librrds-perl libconfig-general-perl libhtml-parser-perl  libregexp-common-perl
echo ''
echo 'Setting Collected3 Permissions'
sudo chmod +x /var/www/collectd/bin


echo ''
echo ''
echo '========INSTALLING VoxPop============'
echo 'Please enter the password for your VoxPop user.'
su voxpop -c "svn checkout http://voxpoptc.googlecode.com/svn/branches/v2 ~/"

echo ''
echo ''
echo '========Applying VOXPOP Permissions============'
echo 'Applying Permissions to Beanstalkd Collectd Script'
sudo chmod +x /home/voxpop/scripts/beanstalkd_collectd.rb

echo ''
echo ''
echo '========Restarting Apache2============'
sudo apache2ctl restart

echo ''
echo ''
echo '========STARTING VoxPop============'
echo 'Please enter the password for your VoxPop user.'
su voxpop -c "~/scripts/init_voxpop.command"
