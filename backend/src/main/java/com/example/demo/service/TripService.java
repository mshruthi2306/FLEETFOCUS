package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DriverRepository;
import com.example.demo.repository.TripRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final DispatchService dispatchService;

    public TripService(TripRepository tripRepository,
                        VehicleRepository vehicleRepository,
                        DriverRepository driverRepository,
                        DispatchService dispatchService) {
        this.tripRepository = tripRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.dispatchService = dispatchService;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public List<Trip> getTripsForDriverUser(SystemUser user) {
        if (user == null) {
            return List.of();
        }
        Driver driver = driverRepository.findAll().stream()
                .filter(d -> d.getUser() != null && user.getId().equals(d.getUser().getId()))
                .findFirst()
                .orElseGet(() -> {
                    Driver newDriver = new Driver();
                    newDriver.setUser(user);
                    String baseLic = "DL-" + user.getUsername().toUpperCase();
                    String finalLic = driverRepository.findAll().stream().anyMatch(d -> baseLic.equalsIgnoreCase(d.getLicenseNumber()))
                            ? "DL-" + user.getId() + "-" + (System.currentTimeMillis() % 10000)
                            : baseLic;
                    newDriver.setLicenseNumber(finalLic);
                    newDriver.setStatus(DriverStatus.AVAILABLE);
                    return driverRepository.save(newDriver);
                });

        return tripRepository.findAll().stream()
                .filter(t -> t.getDriver() != null && t.getDriver().getId() != null && driver.getId().equals(t.getDriver().getId()))
                .toList();
    }

    public Trip startTrip(Long vehicleId, Long driverId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));

        dispatchService.validateDispatch(vehicle, driver);

        Trip trip = new Trip();
        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setStartTime(LocalDateTime.now());
        trip.setStatus(TripStatus.ACTIVE);

        vehicle.setStatus(VehicleStatus.ON_TRIP);
        driver.setStatus(DriverStatus.ON_TRIP);
        vehicleRepository.save(vehicle);
        driverRepository.save(driver);

        return tripRepository.save(trip);
    }

    public Trip endTrip(Long tripId, Double distance) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        if (trip.getStatus() != TripStatus.ACTIVE) {
            throw new BusinessValidationException("Trip is not active and cannot be ended.");
        }

        trip.setEndTime(LocalDateTime.now());
        trip.setDistanceCovered(distance);
        trip.setStatus(TripStatus.COMPLETED);

        Vehicle vehicle = trip.getVehicle();
        if (vehicle != null) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            if (distance != null && distance > 0) {
                Double current = vehicle.getCurrentMileage();
                vehicle.setCurrentMileage((current != null ? current : 0.0) + distance);
            }
            vehicleRepository.save(vehicle);
        }

        Driver driver = trip.getDriver();
        if (driver != null) {
            driver.setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(driver);
        }

        return tripRepository.save(trip);
    }
}