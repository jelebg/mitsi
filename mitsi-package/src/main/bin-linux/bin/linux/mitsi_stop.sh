#!/bin/bash

if [[ $MITSI_HOME = "" ]]; then
  echo MITSI_HOME not set, using default
  pushd `dirname $0` > /dev/null
  MITSI_HOME=`pwd`
  popd > /dev/null
  MITSI_HOME=$(dirname $MITSI_HOME)
  MITSI_HOME=$(dirname $MITSI_HOME)
fi

echo MITSI_HOME=$MITSI_HOME

export CATALINA_HOME=$MITSI_HOME/apache-tomcat-${tomcat.version}
$CATALINA_HOME/bin/shutdown.sh
