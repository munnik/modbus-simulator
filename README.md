# Test environment setup
## Linux host machine
## Signal-K 
## PostgreSQL

### Find the exact Linux distribution used by the host
- use the command **lsb_release -a**
This Linux is a Debian buster (you can get it by using  command).

- take the corresponding steps for this Linux release on the PostgreSQL web site https://www.postgresql.org/download/linux/debian/ (if your distro is a debian, else adapt the link)

- add the line of the postgresql repo on your machine:
**sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'**
you can also edit the file using vi for example.

- then update the repo lists:
**sudo apt-get update**

- install the package, here for buster only version 11 is available:
**apt-get install postgresql-11**

- then check if it is working
**sudo su - postgres**
**posql**
the posgresql prompt should comes:
**psql (11.5 (Debian 11.5-3.pgdg100+1))**
**Type "help" for help.**
- you can get connection info with the \conninfo
**postgres=# \conninfo**
You are connected to database "postgres" as user "postgres" via socket in "/var/run/postgresql" at port "5432".
then you can quit with the \q:
**postgres=# \q**
Next steps could be:
### Create a database
 to be completed
### Create one or several dedicated user
 to be completed
### Create some code on top of signal-k to get GPS data and storing them
 to be completed
### Read this data using an app
 to be completed
 

# Use case n°2
## Description
1. Area like: Aboard Analysis Support
2. Originator: Luerssen
3. Title : Lube oil temperature sensor failure
4. Description: A lube oil temperature sensor failure occured onboard during a sail.
                The related auxillary engine stopped. It has to be interrogated if 
                the engine stopped and the temperature raised subsequently or vice versa.
                Therefore the timestamps of both events have to be compared.
## sensors and protocols
- a physical GPS HOLUM215+ that will use NMEA0183 
- RPM engine will use MODBUS with a software simulator to begin with
- Temperature sensor will use MODBUS with a software simulator to begin with
- The engine running status will MODBUS with a software simulator to begin with
