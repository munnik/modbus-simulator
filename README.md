# Test environment setup
## The PC machine
For the test environment a Nexcom NIFE 200 is used, but any Intel PC should work fine.
## Linux OS
### Debian Buster
A plain installation of is sufficient, installation steps of additional packages with are required will be described below.
## Signal-K
First create a user for Signal-K
```bash
sudo useradd -m -s /bin/bash signalk
sudo passwd signalk
```
### NodeJS
Install NodeJS and install the required npm packages
```bash
sudo apt-get install nodejs npm
sudo npm install -g npm@latest
sudo npm install -g --unsafe-perm signalk-server
```
### Server
Then setup the Signal-K server after switching to the signalk user
```bash
su signalk 
signalk-server-setup
```
After setting up the server copy the files in the `systemd` folder to `/etc/systemd/system/` and start the signalk server
```bash
sudo cp systemd/* /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable signalk.service
sudo systemctl enable signalk.socket
sudo systemctl stop signalk.service
sudo systemctl restart signalk.socket
sudo systemctl restart signalk.service
```

The server is now reachable on port 3000. You now need to setup an admin account on the server by opening the server in a browser and clicking login. On this page you can create an admin account for the server.

### InfluxDB
Install InfluxDB to store signalk data locally
```bash
wget -qO- https://repos.influxdata.com/influxdb.key | sudo apt-key add -
source /etc/os-release
echo "deb https://repos.influxdata.com/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/influxdb.list
sudo apt-get update && sudo apt-get install influxdb
sudo systemctl unmask influxdb.service
sudo systemctl start influxdb
```

Then install the [signalk-to-influxdb](https://github.com/tkurki/signalk-to-influxdb) plugin by going to the signalk appstore and selecting it from the list. When the plugin is done installing, restart the server. The plugin can now be configured on the `server > plugin config` page. On that page you need to configure the following settings:

- Database
    + set this to the name of the database the data should be stored in, can be anything
- Resolution
    + set this to 0ms to store all data
- Record Others
    + Check this box
- Type of List 
    + set this to black to record all data 

### MODBUS simulator and plugin

### cloud connection

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
- a physical GPS HOLUX M215+ that will use NMEA0183 v2.2
  - NMEA Format GGA, RMC, VTG
  - NMEA Format optional    
  - Baud Rate   4800 bit/Sek.
  - Baud Rate   optional    
  - Daten/Check/Stop -Bit    8/N/1
- RPM engine will use MODBUS with a software simulator to begin with
- Temperature sensor will use MODBUS with a software simulator to begin with
- The engine running status will MODBUS with a software simulator to begin with


