# mitsi

## What is Mitsi ?

Mitsi is a very simple to explore a relationnal database. It is different from many other such tools because it is a webapp. You install it once, and then anybody in your team can access it without having to install anything.

## Basic functionnalities

![Screen](/.github/mitsi_screen.png)

## How can I install it ?

If you download it [there](https://github.com/jelebg/mitsi/releases/), you will have a tomcat packaged just for you with the mitsi war.
Unzip the archive, then modify the following files with your favorite text editor :

#### conf/mitsi-datasources.json
In this file you can configure the list of datasource that you will manage with mitsi.
As an example, two basic datasouces are given but you can configure as many as you want.

For the time being, the fields provider and driver may only have the values "oracle_11g" and "oracle.jdbc.driver.OracleDriver".
The connection attributes are straightforward :
* jdbcUrl is the jdbc url to connect to the database. For Oracle databses, you may use the models jdbc:oracle:thin:@hostname:port:SID or jdbc:oracle:thin:@//hostname:port/service
* user : username to connect to the database
* password : password to connect to the database

Others datasource attributes will be used by mitsi :
* description will be displayed along with the datasource
* tags will be used to search or filter datasources
* userGroups is used to specify which users will have the rights to see and access the datasource. Two specials groups mays be used here :
	* _public : the datasource can be accessed by anybody, even if no login has been provided
	* _connected : any connected user will be able to access the datasource

#### conf/mitsi-users.json

This file is used to configure user management. There is three section in it :
* users is a list of users and there passwords (optional). This section is a convenient to configure the users, but is is advised to use ldap configuration instead.
* ldapAuthent is used to configure the ldap server if you have one(optional).
* groups defines a list of groups. Each group may contain many users or groups. These groups can be used in the datasource configuration, with the userGroups attribute, to restrict access to a datasource to some users.

## how may I compile it myself
to compile sources :
* download ojdbc7.jar on oracle's website
* mvn install:install-file -Dfile=ojdbc7.jar -DgroupId=oracle -DartifactId=oracle-jdbc-driver -Dversion=1.0.0-repo -Dpackaging=jar
* mvn clean install
