package com.example.demo.service;

import com.example.demo.entity.Driver;
import com.example.demo.entity.DriverStatus;
import com.example.demo.entity.SystemUser;
import com.example.demo.repository.DriverRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public List<Driver> getDriversByStatus(DriverStatus status) {
        return driverRepository.findByStatus(status);
    }

    public Driver getOrCreateDriverForUser(SystemUser user) {
        if (user == null) {
            return null;
        }
        return driverRepository.findAll().stream()
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
    }
}