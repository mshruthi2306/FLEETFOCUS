package com.example.demo.service;

import com.example.demo.entity.MaintenanceLog;
import com.example.demo.entity.SystemUser;
import com.example.demo.entity.Vehicle;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.MaintenanceLogRepository;
import com.example.demo.repository.SystemUserRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final VehicleRepository vehicleRepository;
    private final SystemUserRepository systemUserRepository;

    @Autowired
    public MaintenanceService(MaintenanceLogRepository maintenanceLogRepository,
                              VehicleRepository vehicleRepository,
                              SystemUserRepository systemUserRepository) {
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.vehicleRepository = vehicleRepository;
        this.systemUserRepository = systemUserRepository;
    }

    public MaintenanceService(MaintenanceLogRepository maintenanceLogRepository) {
        this(maintenanceLogRepository, null, null);
    }

    public List<MaintenanceLog> getAllLogs() {
        return maintenanceLogRepository.findAll(Sort.by(Sort.Direction.DESC, "serviceDate", "id"));
    }

    public MaintenanceLog getLogById(Long id) {
        return maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance log not found with id: " + id));
    }

    @Transactional
    public MaintenanceLog addLog(MaintenanceLog log) {
        if (log == null) {
            throw new BusinessValidationException("Maintenance log request body cannot be null.");
        }

        Vehicle vehicle = resolveVehicle(log.getVehicle());
        SystemUser technician = resolveTechnician(log.getTechnician());

        log.setVehicle(vehicle);
        log.setTechnician(technician);

        if (log.getServiceDate() == null) {
            log.setServiceDate(LocalDate.now());
        }

        if (log.getDescription() == null || log.getDescription().trim().isEmpty()) {
            throw new BusinessValidationException("Description cannot be empty.");
        }

        if (log.getCost() == null) {
            log.setCost(0.0);
        } else if (log.getCost() < 0) {
            throw new BusinessValidationException("Cost cannot be negative.");
        }

        return maintenanceLogRepository.save(log);
    }

    @Transactional
    public MaintenanceLog updateLog(Long id, MaintenanceLog updatedData) {
        MaintenanceLog existing = getLogById(id);

        if (updatedData == null) {
            throw new BusinessValidationException("Update data cannot be null.");
        }

        if (updatedData.getVehicle() != null) {
            existing.setVehicle(resolveVehicle(updatedData.getVehicle()));
        }

        if (updatedData.getTechnician() != null) {
            existing.setTechnician(resolveTechnician(updatedData.getTechnician()));
        }

        if (updatedData.getServiceDate() != null) {
            existing.setServiceDate(updatedData.getServiceDate());
        }

        if (updatedData.getDescription() != null && !updatedData.getDescription().trim().isEmpty()) {
            existing.setDescription(updatedData.getDescription().trim());
        }

        if (updatedData.getCost() != null) {
            if (updatedData.getCost() < 0) {
                throw new BusinessValidationException("Cost cannot be negative.");
            }
            existing.setCost(updatedData.getCost());
        }

        return maintenanceLogRepository.save(existing);
    }

    @Transactional
    public void deleteLog(Long id) {
        MaintenanceLog existing = getLogById(id);
        maintenanceLogRepository.delete(existing);
    }

    private Vehicle resolveVehicle(Vehicle v) {
        if (v == null) {
            throw new BusinessValidationException("Vehicle is required for maintenance record.");
        }
        if (vehicleRepository == null) {
            return v;
        }

        if (v.getId() != null) {
            return vehicleRepository.findById(v.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + v.getId()));
        }

        if (v.getLicensePlate() != null && !v.getLicensePlate().trim().isEmpty()) {
            return vehicleRepository.findByLicensePlateIgnoreCase(v.getLicensePlate().trim())
                    .orElseGet(() -> vehicleRepository.findByLicensePlate(v.getLicensePlate().trim())
                            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with license plate: " + v.getLicensePlate())));
        }

        if (v.getVin() != null && !v.getVin().trim().isEmpty()) {
            return vehicleRepository.findByVin(v.getVin().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with VIN: " + v.getVin()));
        }

        throw new BusinessValidationException("Please select or provide a valid vehicle.");
    }

    private SystemUser resolveTechnician(SystemUser tech) {
        if (tech == null) {
            throw new BusinessValidationException("Technician is required for maintenance record.");
        }
        if (systemUserRepository == null) {
            return tech;
        }

        if (tech.getId() != null) {
            return systemUserRepository.findById(tech.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + tech.getId()));
        }

        if (tech.getUsername() != null && !tech.getUsername().trim().isEmpty()) {
            return systemUserRepository.findByUsername(tech.getUsername().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician not found with username: " + tech.getUsername()));
        }

        throw new BusinessValidationException("Please select or provide a valid technician.");
    }
}