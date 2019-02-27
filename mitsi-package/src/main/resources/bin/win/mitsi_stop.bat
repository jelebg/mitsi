@echo off
IF defined MITSI_HOME goto :mitsi_stop
  set MITSI_HOME=%~dp0

  pushd %MITSI_HOME%\..\..
	set MITSI_HOME=%cd%
  popd

:mitsi_stop
echo MITSI_HOME=%MITSI_HOME%

set CATALINA_HOME=%p%\apache-tomcat-${tomcat.version}
%CATALINA_HOME%\bin\shutdown.sh
