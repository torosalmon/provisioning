#!/bin/sh

# 起動判定ファイルの存在を調べ、初回起動以降はスキップする
test -f /etc/.vagrant_provision && exit

echo '# ============'
echo '# CentOS SHELL'
echo '# ============'
echo ''

echo '$ sudo yum -y update'
echo '# yumアップデート'
sudo yum -y update
echo ''

# ========
# 日本語化
# ========

echo '$ sudo localectl set-locale LANG=ja_JP.UTF8'
sudo localectl set-locale LANG=ja_JP.UTF8
echo ''

echo '$ sudo localectl set-keymap jp106'
sudo localectl set-keymap jp106
echo ''

# echo '$ sudo yum -y install vlgothic-*'
# sudo yum -y install vlgothic-*
# echo ''

# =======
# Desktop
# =======

# echo '$ sudo yum -y groupinstall "GNOME Desktop"'
# sudo yum -y groupinstall "GNOME Desktop"
# echo ''

# echo '$ systemctl set-default graphical.target'
# systemctl set-default graphical.target
# echo ''

# ===========
# GuestAddons
# ===========

# echo '$ sudo yum -y install kernel-devel gcc'
# sudo yum -y install kernel-devel gcc
# echo ''

# ==================
# ファイアーウォール
# ==================

echo '$ sudo systemctl stop firewalld'
sudo systemctl stop firewalld
echo ''

echo '$ systemctl disable firewalld'
sudo systemctl disable firewalld
echo ''

# ======
# Apache
# ======

echo '$ sudo yum -y install httpd'
echo '# Apacheインストール'
sudo yum -y install httpd
echo ''

echo '$ sudo systemctl enable httpd.service'
echo '# OS起動時にApacheを自動起動します'
sudo systemctl enable httpd.service
echo ''

echo '$ systemctl start httpd.service'
echo '# Apache起動'
systemctl start httpd.service
echo ''

# ====
# PHP7
# ====

echo '$ rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm'
echo '# EPELリポジトリ追加'
rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
echo ''

echo '$ rpm -Uvh http://rpms.famillecollet.com/enterprise/remi-release-7.rpm'
echo '# REMIリポジトリ追加'
rpm -Uvh http://rpms.famillecollet.com/enterprise/remi-release-7.rpm
echo ''

echo '$ sudo yum -y install --enablerepo=remi,remi-php70 php php-devel php-mbstring php-pdo php-gd'
echo '# PHP7インストール'
sudo yum -y install --enablerepo=remi,remi-php70 php php-devel php-mbstring php-pdo php-gd
echo ''

# ========
# MySQL5.7
# ========

echo '$ sudo yum -y remove mariadb-libs'
echo '# MariaDBの削除'
sudo yum -y remove mariadb-libs
rm -rf /var/lib/mysql/
echo ''

echo '$ sudo yum -y localinstall http://dev.mysql.com/get/mysql57-community-release-el7-7.noarch.rpm'
sudo yum -y localinstall http://dev.mysql.com/get/mysql57-community-release-el7-7.noarch.rpm
echo ''

echo '$ sudo yum -y install mysql-community-server'
sudo yum -y install mysql-community-server
echo ''

echo '$ systemctl enable mysqld.service'
systemctl enable mysqld.service
echo ''

# $ vagrant upの初回起動判定ファイルを保存
date > /etc/.vagrant_provision

echo '# ==========='
echo '# CentOS Exit'
echo '# ==========='
echo ''
