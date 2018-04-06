# mitsi

## What is Mitsi ?

Mitsi is a very simple web application to explore a relational database. It works for Oracle, PostgreSQL, H2 and MySQL/MariaDB, and can be extended to other RDBMS.

With it you may explore your physical data model easily. You can also define labels to find anomalies in your datamodel, and use layers to see differences between databases instantly.

## Basic functionalities

* Instant search bar for tables, columns, indexes and constraints 
* Graph navigation, and graph interactions to display table data and metadata 
* Pathfinding using the relation graph
* "Candidate FK" detection to find FK to create, or to display links between tables that is not defined as foreign key constraint
* Layers to display differences between database schemas

Watch this silent video to see this functionalities in action : [https://www.youtube.com/watch?v=VqIGvtIy5l0](https://www.youtube.com/watch?v=VqIGvtIy5l0)

![Screen](/.github/mitsi_screen.png)

## How can I install it ?

### Prerequisites

Java (version >= 7) must be installed, and the **JAVA_HOME** environment variable must be set.

### Download

If you download it [there](https://github.com/jelebg/mitsi/releases/), you will have a tomcat pre-configured with the Mitsi war.
Unzip the archive (.zip or .tar.gz).
Then modify the following files to configure your first database connection :

#### conf/mitsi-datasources.json
In this file you can configure the list of datasource that you will manage with mitsi.
As an example, two basic datasouces are given but you can configure as many as you want.

* **provider** : h2, oracle, postgre or mysql (other providers can be defined in plugins)
* **driver** : the class name of the JDBC driver you want to use. You may add other drivers using plugins, but the following drivers are provided in mitsi
    * For oracle : oracle.jdbc.driver.OracleDriver
    * For PostgreSQL : org.postgresql.Driver
    * For h2 : org.h2.Driver
    * For MySQL/MariaDb : org.mariadb.jdbc.Driver
The connection attributes are straightforward :
* **jdbcUrl** is the jdbc url to connect to the database.
    * For Oracle databases, you may use the models jdbc:oracle:thin:@hostname:port:SID or jdbc:oracle:thin:@//hostname:port/service
    * For PostgreSQL, you may use the model : jdbc:postgresql://hostname:port/database
    * For H2 : jdbc:h2:file:/path/to/your/db
    * For MySQL/MariaDB
* **user** : username to connect to the database
* **password** : password to connect to the database

Others datasource attributes will be used by mitsi :
* **description** will be displayed along with the datasource
* **tags** will be used to search or filter datasources
* **maxExportRows** max number of rows displayed or exported
* **maxRunningStatementPerUser** : max number of statement that a single user my run at the same time on the same datasource
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

#### conf/mitsi-rules.json

* **label** name of the label
* **labelDisplay** (optional) : name to display, when it is neccessary to display a different name to the user
* **labelComment** (optional) : comment to display when hovering the filters
* **rule** : the rule to define if the label is to be applied to the table or to the column or not. More details are available on the wiki here : [https://github.com/jelebg/mitsi/wiki](https://github.com/jelebg/mitsi/wiki)
* **comment** : the comment to display along with the column or the table. May contain variables using ${...}
* **type** : normal, warning or diff. Diff labels are displayed only in layers
* **scope** : column or table
* **candidateFkToTable** (optional) : used for candidate FK detection. Gives the name of the target table of the candidate FK. May contain variables using ${...}

### URL

By default, mitsi is accessible on the port 9035.

If you installed it on a server, you may access it using this URL : [http://<your_server_hostname>:9035/mitsi/](http://<your_server_hostname>:9035/mitsi/)

If you installed it on your desktop, you may also use this URL : [http://localhost:9035/mitsi/](http://localhost:9035/mitsi/)

## how may I compile it myself
to compile sources, you will have to download oracle's jdbc driver, compile the custom version of c3p0 and compile mitsi :

* download ojdbc7.jar on oracle's website
* mvn install:install-file -Dfile=ojdbc7.jar -DgroupId=oracle -DartifactId=oracle-jdbc-driver -Dversion=1.0.0-repo -Dpackaging=jar

* git clone https://github.com/jelebg/c3p0_mitsi/tree/mitsi-c3p0-0.9.5.2
* switch to mitsi's specific branch : git checkout mitsi-c3p0-0.9.5.2
* create the lib library and place mchange-commons-java-0.2.11.jar and mchange-commons-java-0.2.11-sources.jar in it (you can download here for example : http://repo1.maven.org/maven2/com/mchange/mchange-commons-java/0.2.11/)
* compile it with ant
* install the jar in the maven repo : mvn install:install-file -Dfile=build/c3p0-0.9.5.2.jar -DgroupId=com.mchange -DartifactId=c3p0 -Dversion=0.9.5.2-mitsi -Dpackaging=jar

* clone mitsi : git clone https://github.com/jelebg/mitsi.git 
* mvn clean install -DskipTests
