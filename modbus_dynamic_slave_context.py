import datetime
from typing import Iterable

from pymodbus.interfaces import IModbusSlaveContext


class ModbusDynamicSlaveContext(IModbusSlaveContext):
    def __init__(self):
        self.store = None
        self.zero_mode = False
        self.create_empty_stores()

    def create_empty_stores(self):
        self.store = {'d': {}, 'c': {}, 'i': {}, 'h': {}}

    def reset(self):
        self.create_empty_stores()

    def validate(self, fx, address, count=1):
        if not self.zero_mode:
            address = address + 1

        for i in range(address, address + count):
            if i not in self.store[self.decode(fx)]:
                return False
        return True

    def getValues(self, fx, address, count=1):
        if not self.validate(fx, address, count):
            raise IndexError("One or more addresses are not available")

        if not self.zero_mode:
            address = address + 1

        result = []
        for i in range(address, address + count):
            result.append(self.store[self.decode(fx)][i](datetime.datetime.now()))
        return result

    def setValues(self, fx, address, values):
        raise NotImplementedError("Values cannot be set on a ModbusDynamicSlaveContext")

    def setLambda(self, fx, address, lambda_functions):
        """

        :param fx:
        :param address:
        :param lambda_functions: a lamda function or a list of lambda functions, the lambda function should require one
        parameter which is the current time
        :return:
        """
        if not self.zero_mode:
            address = address + 1

        if not isinstance(lambda_functions, Iterable):
            lambda_functions = [lambda_functions]

        for i, f in zip(range(address, address + len(lambda_functions)), lambda_functions):
            self.store[self.decode(fx)][i] = f

        return self
