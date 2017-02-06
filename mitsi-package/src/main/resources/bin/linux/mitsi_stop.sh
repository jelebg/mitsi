#!/bin/sh
p=$(pwd)
p=$(dirname $pwd)
p=$(dirname $pwd)

export CATALINA_HOME=$p\apache-tomcat-8.0.20
$CATALINA_HOME\bin\shutdown.sh
