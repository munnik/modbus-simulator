# Data Inspector

signalk webapp to view stored data.

## Requirements

This webapp requires that the [signalk-history-plugin](https://github.com/codekilo/signalk-history-plugin) is installed and setup. 
The history plugin requires access to an influx database, this requirement can be met with an ssh tunnel to the influx database on the ship or the central server. Influxdb uses port `8086`.

## Installation
To install the webapp run `sudo npm link` in the `data-inspector` directory.
Then run `npm link code-kilo-data-inspector` in the `~/.signalk` directory.

The webapp can then be accessed at [http://localhost:3000/code-kilo-data-inspector](http://localhost:3000/code-kilo-data-inspector).
