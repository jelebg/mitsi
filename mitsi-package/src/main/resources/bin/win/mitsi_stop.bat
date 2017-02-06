pushd ..\..
set p=%cd%
popd

set CATALINA_HOME=%p%\apache-tomcat-8.0.20
%CATALINA_HOME%\bin\shutdown.sh
