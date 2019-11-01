#!/usr/bin/env python
import logging
import random

from pymodbus.datastore import ModbusServerContext
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.server.sync import StartTcpServer

from modbus_dynamic_slave_context import ModbusDynamicSlaveContext

FORMAT = ('%(asctime)-15s %(threadName)-15s'
          ' %(levelname)-8s %(module)-15s:%(lineno)-8s %(message)s')
logging.basicConfig(format=FORMAT)
logging.getLogger().setLevel(logging.DEBUG)

HOST = 'localhost'
PORT = 5020


def run_server(host, port):
    store = ModbusDynamicSlaveContext()
    lambda_functions = [
        lambda t: random.randint(0, 10000),
        lambda t: random.randint(0, 10000),
        lambda t: random.randint(0, 10000),
        lambda t: random.randint(0, 10000),
    ]
    store.setLambda(4, 0, lambda_functions)
    context = ModbusServerContext(slaves=store, single=True)

    identity = ModbusDeviceIdentification()
    identity.VendorName = 'Pymodbus'
    identity.ProductCode = 'PM'
    identity.VendorUrl = 'http://github.com/riptideio/pymodbus/'
    identity.ProductName = 'Pymodbus Server'
    identity.ModelName = 'Pymodbus Server'
    identity.MajorMinorRevision = '2.2.0'

    StartTcpServer(context, identity=identity, address=(host, port))


if __name__ == "__main__":
    run_server(HOST, PORT)
