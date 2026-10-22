package com.example.demo.service;

import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import com.example.demo.exception.DuplicateVinException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final AlertRepository alertRepository;
    private final TelemetryDataRepository telemetryDataRepository;

    public VehicleService(VehicleRepository vehicleRepository,
                           TripRepository tripRepository,
                           MaintenanceLogRepository maintenanceLogRepository,
                           AlertRepository alertRepository,
                           TelemetryDataRepository telemetryDataRepository) {
        this.vehicleRepository = vehicleRepository;
        this.tripRepository = tripRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.alertRepository = alertRepository;
        this.telemetryDataRepository = telemetryDataRepository;
    }

    public Page<Vehicle> getAllVehicles(Pageable pageable) {
        return vehicleRepository.findAll(pageable);
    }

    public List<Vehicle> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatus(status);
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    public Vehicle addVehicle(Vehicle vehicle) {
        if (vehicle.getVin() != null && vehicleRepository.findByVin(vehicle.getVin().trim()).isPresent()) {
            throw new DuplicateVinException("VIN already exists");
        }
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        if (vehicle.getCurrentMileage() == null) {
            vehicle.setCurrentMileage(0.0);
        }
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicle) {
        Vehicle existing = getVehicleById(id);
        existing.setVin(vehicle.getVin());
        existing.setLicensePlate(vehicle.getLicensePlate());
        existing.setModel(vehicle.getModel());
        existing.setStatus(vehicle.getStatus());
        existing.setCurrentMileage(vehicle.getCurrentMileage());
        return vehicleRepository.save(existing);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        tripRepository.deleteByVehicle(vehicle);
        maintenanceLogRepository.deleteByVehicle(vehicle);
        alertRepository.deleteByVehicle(vehicle);
        telemetryDataRepository.deleteByVehicle(vehicle);
        vehicleRepository.delete(vehicle);
    }
}