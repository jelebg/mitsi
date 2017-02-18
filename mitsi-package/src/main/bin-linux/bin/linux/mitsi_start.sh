#!/bin/sh
p=$(pwd)
p=$(dirname $p)
p=$(dirname $p)

export CATALINA_HOME=$p/apache-tomcat-8.0.20
$CATALINA_HOME/bin/startup.sh
