# mitsi

## What is Mitsi ?

Mitsi is a very simple web application to explore a relational database. It works for Oracle and PostgreSQL, and can be extended to other RDBMS.

With it you may explore your physical data model easily. Unlike other tools, it is quick and cool (I swear).

## Basic functionalities

* Instant search bar for tables, columns, indexes and constraints 
* Graph navigation, and graph interactions to display table data and metadata 
* Pathfinding using the relation graph

Watch this silent video to see this functionalities in action : [https://www.youtube.com/watch?v=VqIGvtIy5l0](https://www.youtube.com/watch?v=VqIGvtIy5l0)

![Screen](/.github/mitsi_screen.png)

## How can I install it ?

### prerequisites

Java (version >= 7) must be installed, and the **JAVA_HOME** environment variable must be set.

### download

If you download it [there](https://github.com/jelebg/mitsi/releases/), you will have a tomcat pre-configured with the Mitsi war.
Unzip the archive (.zip or .tar.gz).
Then modify the following files to configure your first database connection :

#### conf/mitsi-datasources.json
In this file you can configure the list of datasource that you will manage with mitsi.
As an example, two basic datasouces are given but you can configure as many as you want.

* For the time being, the fields **provider** and **driver** may only have the values "oracle_11g" and "oracle.jdbc.driver.OracleDriver", or "postgre" and "org.postgresql.Driver" (but it can be extended by developing a plugin).
The connection attributes are straightforward :
* **jdbcUrl** is the jdbc url to connect to the database. For Oracle databases, you may use the models jdbc:oracle:thin:@hostname:port:SID or jdbc:oracle:thin:@//hostname:port/service
* **user** : username to connect to the database
* **password** : password to connect to the database

Others datasource attributes will be used by mitsi :
* **description** will be displayed along with the datasource
* **tags** will be used to search or filter datasources
* **userGroups** is used to specify which users will have the rights to see and access the datasource. Two specials groups mays be used here :
	* _public : the datasource can be accessed by anybody, even if no login has been provided
	* _connected : any connected user will be able to access the datasource

* **pool** : connection pool parameters. for example : "pool" : { maxIdleTimeSec : 600,  maxSize : 5}
	* initialSize : pool size when connecting for the first time (default : 0)
	* minSize : minimum pool size (default : 0)
	* maxSize : maximum pool size (default : 5)
	* maxIdleTimeSec : maximum time, in seconds, a connecting will be kept while being idle
	* acquireIncrement : number of connections acquired at once

#### conf/mitsi-users.json

This file is used to configure user management. There is three section in it :
* **users** is a list of users and there passwords (optional). This section is a convenient to configure the users, but is is advised to use ldap configuration instead.
* **ldapAuthent** is used to configure the ldap server if you have one(optional).
* **groups** defines a list of groups. Each group may contain many users or groups. These groups can be used in the datasource configuration, with the userGroups attribute, to restrict access to a datasource to some users.

## how may I compile it myself
to compile sources, you will have to download oracle's jdbc driver, compile the custom version of c3p0 and compile mitsi :

* download ojdbc7.jar on oracle's website
* mvn install:install-file -Dfile=ojdbc7.jar -DgroupId=oracle -DartifactId=oracle-jdbc-driver -Dversion=1.0.0-repo -Dpackaging=jar

* git clone https://github.com/jelebg/c3p0_mitsi/tree/mitsi-c3p0-0.9.5.2
* switch to mitsi's specific branch : git checkout mitsi-c3p0-0.9.5.2
* create the lib library and place mchange-commons-java-0.2.11.jar and mchange-commons-java-0.2.11-sources.jar in it (you can download here for example : http://repo1.maven.org/maven2/com/mchange/mchange-commons-java/0.2.11/)
* compile it with ant
* instal the jar in the maven repo : mvn install:install-file -Dfile=build/c3p0-0.9.5.2.jar -DgroupId=com.mchange -DartifactId=c3p0 -Dversion=0.9.5.2-mitsi -Dpackaging=jar

* clone mitsi : git clone https://github.com/jelebg/mitsi.git 
* mvn clean install
