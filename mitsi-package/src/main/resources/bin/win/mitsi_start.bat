@echo off
IF defined MITSI_HOME goto :mitsi_start
  set MITSI_HOME=%~dp0

  pushd %MITSI_HOME%\..\..
	set MITSI_HOME=%cd%
  popd

:mitsi_start
echo MITSI_HOME=%MITSI_HOME%

set CATALINA_HOME=%MITSI_HOME%\apache-tomcat-8.0.20
%CATALINA_HOME%\bin\startup.bat
