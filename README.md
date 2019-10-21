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
- to create a database,
- to create one or several dedicated user.
- to create some code on top of signal-k to get GPS data and storing them
- to read this data using an app

# use_case_2
