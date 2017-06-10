#!/bin/bash

if [[ $MITSI_HOME = "" ]]; then
  echo MITSI_HOME not set, using default
  pushd `dirname $0` > /dev/null
  MITSI_HOME=`pwd`
  popd > /dev/null
  MITSI_HOME=$(dirname $MITSI_HOME)
  MITSI_HOME=$(dirname $MITSI_HOME)
  export MITSI_HOME=$MITSI_HOME
fi

echo MITSI_HOME=$MITSI_HOME

export CATALINA_HOME=$MITSI_HOME/apache-tomcat-8.0.20
$CATALINA_HOME/bin/startup.sh

echo if you use the default configuration, try connecting to http://$(hostname):9035/mitsi