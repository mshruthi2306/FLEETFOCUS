package com.example.demo.service;

import com.example.demo.entity.Driver;
import com.example.demo.entity.DriverStatus;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import com.example.demo.exception.BusinessValidationException;
import org.springframework.stereotype.Service;

@Service
public class DispatchService {

    public void validateDispatch(Vehicle vehicle, Driver driver) {
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new BusinessValidationException("Vehicle is not available for dispatch.");
        }
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new BusinessValidationException("Driver is not available for dispatch.");
        }
    }
}