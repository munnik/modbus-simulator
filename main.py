#!/usr/bin/env python
import logging
import random

from pymodbus.datastore import ModbusServerContext
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.server.sync import StartTcpServer

from modbus_dynamic_slave_context import ModbusDynamicSlaveContext

from math import floor, sin

FORMAT = ('%(asctime)-15s %(threadName)-15s'
          ' %(levelname)-8s %(module)-15s:%(lineno)-8s %(message)s')
logging.basicConfig(format=FORMAT)
logging.getLogger().setLevel(logging.DEBUG)

HOST = 'localhost'
PORT = 5020


def run_server(host, port):
    store = ModbusDynamicSlaveContext()
    #around 1300 rpm
    lambda_functions_rpm = [
        lambda t: floor(1240 + (t.timestamp() % 120 + random.randint(-2,5)))*1000 >> 16,
        lambda t: floor(1240 + (t.timestamp() % 120 + random.randint(-2,5)))*1000 & 0xFFFF
    ]
    store.setLambda(4, 51300, lambda_functions_rpm)

    #around 60c
    lambda_functions_oiltemp = [
        lambda t: floor(55 + (t.timestamp() % 120 + random.randint(-2,5)) / 12) * 1000 >>16,
        lambda t: floor(55 + (t.timestamp() % 120 + random.randint(-2,5)) / 12) * 1000 & 0xFFFF
    ]
    store.setLambda(4, 51460, lambda_functions_oiltemp)

    # around 5 bar
    lambda_functions_oilpressure = [
        lambda t: floor(490 + (t.timestamp() % 120 + random.randint(-2, 5)/10))* 1000 >> 16,
        lambda t: floor(490 + (t.timestamp() % 120 + random.randint(-2, 5)/10))*1000 & 0xFFFF
    ]
    store.setLambda(4, 51426, lambda_functions_oilpressure)

    #constantly running since 2019-11-04
    lambda_functions_engine_hours = [
        lambda t: floor((t.timestamp() - 1572869165) / 36) >> 16,
        lambda t: floor((t.timestamp() - 1572869165) / 36 ) & 0xFFFF
    ]
    store.setLambda(4, 51360, lambda_functions_engine_hours)

    #around 80c
    lambda_functions_coolanttemp = [
        lambda t: floor(90 - (t.timestamp() % 120 + random.randint(-2, 5)) / 12) * 1000 >> 16,
        lambda t: floor(90 - (t.timestamp() % 120 + random.randint(-2, 5)) / 12) * 1000 & 0xFFFF
    ]
    store.setLambda(4, 51414, lambda_functions_coolanttemp)

    # around 1 bar
    lambda_functions_coolantpressure = [
        lambda t: floor(110 - (t.timestamp() % 120 + random.randint(-2, 5)/10))* 1000 >> 16,
        lambda t: floor(110 - (t.timestamp() % 120 + random.randint(-2, 5)/10))*1000 & 0xFFFF
    ]
    store.setLambda(4, 51606, lambda_functions_coolantpressure)

    # around 2 bar
    lambda_functions_boostpressure = [
        lambda t: floor(190 + (t.timestamp() % 120 + random.randint(-2, 5)/10))* 1000 >> 16,
        lambda t: floor(190 + (t.timestamp() % 120 + random.randint(-2, 5)/10))*1000 & 0xFFFF
    ]
    store.setLambda(4, 51408, lambda_functions_boostpressure)

    #around 20c
    lambda_functions_intaketemp = [
        lambda t: 0,
        lambda t: floor(19500 + t.timestamp() % 1000)
    ]
    store.setLambda(4, 51440, lambda_functions_intaketemp)

    #around 50%
    lambda_functions_load = [
        lambda t: 0,
        lambda t: floor((1240 + (t.timestamp() % 120)) / 2600 * 1000)
    ]
    store.setLambda(4, 51422, lambda_functions_load)

    #around 350c
    lambda_functions_exhaust_temp =[
        lambda t: floor(340 + (t.timestamp() % 120 + random.randint(-2, 5)) / 10) * 1000 >> 16,
        lambda t: floor(340 + (t.timestamp() % 120 + random.randint(-2, 5)) / 10) * 1000 & 0xFFFF
    ]
    store.setLambda(4, 51442, lambda_functions_exhaust_temp)

    #around 60c
    lambda_functions_transmissionoiltemp = [
        lambda t: floor(50 + (t.timestamp() % 240 + random.randint(-2, 5)) / 12) * 1000 >> 16,
        lambda t: floor(50 + (t.timestamp() % 240 + random.randint(-2, 5)) / 12) * 1000 & 0xFFFF
        ]
    store.setLambda(4, 51454, lambda_functions_transmissionoiltemp)

    #around 15bar
    lambda_functions_transmissionoilpressure = [
        lambda t: floor(1490 + (t.timestamp() % 120 + random.randint(-2, 5) / 10)) *  1000 >> 16,
        lambda t: floor(1490 + (t.timestamp() % 120 + random.randint(-2, 5) / 10)) * 1000 & 0xFFFF
    ]
    store.setLambda(4, 51452, lambda_functions_transmissionoilpressure)

    #using 100l/h since 2019-11-04
    lambda_functions_fuelused = [
        lambda t: floor((t.timestamp() - 1572869165) / 36 * 1000) >> 16,
        lambda t: floor((t.timestamp() - 1572869165) / 36 * 1000) & 0xFFFF
    ]
    store.setLambda(4, 51372, lambda_functions_fuelused)

    # around 100l/h
    lambda_functions_fuelrate = [
        lambda t: floor(97 + (t.timestamp() % 120 + random.randint(-2, 5)) / 20) * 1000 >> 16,
        lambda t: floor(97 + (t.timestamp() % 120 + random.randint(-2, 5)) / 20) * 1000 & 0xFFFF
    ]
    store.setLambda(4, 51436, lambda_functions_fuelrate)
    
    # around 2.8 bar
    lambda_functions_fuelpressure = [
         lambda t: floor(290 - (t.timestamp() % 120 + random.randint(-2, 5)/10))* 1000 >> 16,
        lambda t: floor(290 - (t.timestamp() % 120 + random.randint(-2, 5)/10))*1000 & 0xFFFF
    ]
    store.setLambda(4, 51432, lambda_functions_fuelpressure)

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
