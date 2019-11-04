#!/usr/bin/env python
import logging
import random

from pymodbus.datastore import ModbusServerContext
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.server.sync import StartTcpServer

from modbus_dynamic_slave_context import ModbusDynamicSlaveContext

from math import floor

FORMAT = ('%(asctime)-15s %(threadName)-15s'
          ' %(levelname)-8s %(module)-15s:%(lineno)-8s %(message)s')
logging.basicConfig(format=FORMAT)
logging.getLogger().setLevel(logging.DEBUG)

HOST = 'localhost'
PORT = 5020


def run_server(host, port):
    store = ModbusDynamicSlaveContext()
    lambda_functions_rpm = [
        lambda t: floor(1940 + (t.timestamp() % 120 + random.randint(-2,5)))*1000 >> 16,
        lambda t: floor(1940 + (t.timestamp() % 120 + random.randint(-2,5)))*1000 & 0xFFFF
    ]
    store.setLambda(4, 51300, lambda_functions_rpm)

    lambda_functions_temp = [
        lambda t: floor(140 + (t.timestamp() % 120 + random.randint(-2,5)))*1000 >> 16,
        lambda t: floor(140 + (t.timestamp() % 120 + random.randint(-2,5)))*1000 & 0xFFFF
    ]
    store.setLambda(4, 51460, lambda_functions_temp)
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
