# mitsi

to compile sources :
download ojdbc7.jar
mvn install:install-file -Dfile=ojdbc7.jar -DgroupId=oracle -DartifactId=oracle-jdbc-driver -Dversion=1.0.0-repo -Dpackaging=jar
mvn clean install
