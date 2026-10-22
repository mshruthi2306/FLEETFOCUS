package com.example.demo.config;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final SystemUserRepository systemUserRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final TelemetryDataRepository telemetryDataRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(SystemUserRepository systemUserRepository,
                       VehicleRepository vehicleRepository,
                       DriverRepository driverRepository,
                       TripRepository tripRepository,
                       MaintenanceLogRepository maintenanceLogRepository,
                       TelemetryDataRepository telemetryDataRepository,
                       PasswordEncoder passwordEncoder) {
        this.systemUserRepository = systemUserRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.telemetryDataRepository = telemetryDataRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedVehicles();
        seedDrivers();
        seedTrips();
        seedMaintenanceLogs();
        seedTelemetry();
    }

    private void seedUsers() {
        createUserIfAbsent("manager", "admin123", "manager@fleetfocus.com", UserRole.FLEET_MANAGER);
        createUserIfAbsent("dispatcher", "admin123", "dispatcher@fleetfocus.com", UserRole.DISPATCHER);
        createUserIfAbsent("driver1", "driver123", "driver1@fleetfocus.com", UserRole.DRIVER);
        createUserIfAbsent("driver2", "driver123", "driver2@fleetfocus.com", UserRole.DRIVER);
        createUserIfAbsent("tech1", "tech123", "tech1@fleetfocus.com", UserRole.MAINTENANCE_TECH);
    }

    private SystemUser createUserIfAbsent(String username, String rawPassword, String email, UserRole role) {
        return systemUserRepository.findByUsername(username).orElseGet(() -> {
            SystemUser user = new SystemUser(username, passwordEncoder.encode(rawPassword), email, role);
            return systemUserRepository.save(user);
        });
    }

    private void seedVehicles() {
        // 1. Swift-23 | Model: Maruti Suzuki Swift
        seedVehicle(
                "Swift-23",
                new String[]{"swift-23", "SWIFT-23"},
                "MA3EFA12S00100023",
                new String[]{"123456789abcdefch"},
                "Maruti Suzuki Swift",
                VehicleStatus.AVAILABLE,
                12500.0
        );

        // 2. Actros-X1 | Model: Mercedes-Benz Actros
        seedVehicle(
                "Actros-X1",
                new String[]{"XYZ-5678", "xyz-5678", "ACTROS-X1"},
                "1FM5K8F85HGA0000",
                new String[]{"1FM5K8F85HGA0000"},
                "Mercedes-Benz Actros",
                VehicleStatus.ON_TRIP,
                45000.0
        );

        // 3. Volvo-FH16 | Model: Volvo FH16
        seedVehicle(
                "Volvo-FH16",
                new String[]{"ABC-1234", "abc-1234", "VOLVO-FH16"},
                "1HGCM82633A00435",
                new String[]{"1HGCM82633A00435"},
                "Volvo FH16",
                VehicleStatus.AVAILABLE,
                15000.0
        );

        // 4. Tata-PRIMA | Model: Tata Prima
        seedVehicle(
                "Tata-PRIMA",
                new String[]{"tata-prima", "TATA-PRIMA"},
                "MAT624125M3A10099",
                new String[]{"MAT624125M3A10099"},
                "Tata Prima",
                VehicleStatus.UNDER_MAINTENANCE,
                63000.0
        );

        // 5. AL-4825 | Model: Ashok Leyland 4825
        seedVehicle(
                "AL-4825",
                new String[]{"al-4825", "AL-4825", "ASHOK-4825"},
                "MB1A4825HGA987654",
                new String[]{"MB1A4825HGA987654"},
                "Ashok Leyland 4825",
                VehicleStatus.AVAILABLE,
                28000.0
        );
    }

    private Vehicle seedVehicle(String primaryPlate, String[] altPlates,
                                String primaryVin, String[] altVins,
                                String model, VehicleStatus defaultStatus, double defaultMileage) {
        // Try finding existing vehicle by plate or vin
        Optional<Vehicle> existing = vehicleRepository.findByLicensePlateIgnoreCase(primaryPlate);

        if (existing.isEmpty()) {
            for (String plate : altPlates) {
                existing = vehicleRepository.findByLicensePlateIgnoreCase(plate);
                if (existing.isPresent()) break;
            }
        }

        if (existing.isEmpty()) {
            existing = vehicleRepository.findByVin(primaryVin);
            if (existing.isEmpty()) {
                for (String vin : altVins) {
                    existing = vehicleRepository.findByVin(vin);
                    if (existing.isPresent()) break;
                }
            }
        }

        if (existing.isPresent()) {
            Vehicle v = existing.get();
            v.setLicensePlate(primaryPlate);
            v.setModel(model);
            if (v.getVin() == null || v.getVin().trim().isEmpty()) {
                v.setVin(primaryVin);
            }
            if (v.getCurrentMileage() == null) {
                v.setCurrentMileage(defaultMileage);
            }
            return vehicleRepository.save(v);
        } else {
            Vehicle newVehicle = new Vehicle();
            newVehicle.setVin(primaryVin);
            newVehicle.setLicensePlate(primaryPlate);
            newVehicle.setModel(model);
            newVehicle.setStatus(defaultStatus);
            newVehicle.setCurrentMileage(defaultMileage);
            return vehicleRepository.save(newVehicle);
        }
    }

    private void seedDrivers() {
        seedDriverIfAbsent("driver1", "DL-12345678");
        seedDriverIfAbsent("driver2", "DL-87654321");
        systemUserRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.DRIVER)
                .forEach(u -> seedDriverIfAbsent(u.getUsername(), "DL-" + u.getUsername().toUpperCase()));
    }

    private void seedDriverIfAbsent(String username, String licenseNumber) {
        Optional<SystemUser> driverUserOpt = systemUserRepository.findByUsername(username);
        if (driverUserOpt.isPresent()) {
            SystemUser driverUser = driverUserOpt.get();
            boolean driverExists = driverRepository.findAll().stream()
                    .anyMatch(d -> d.getUser() != null && d.getUser().getId().equals(driverUser.getId()));
            if (!driverExists) {
                Driver driver = new Driver();
                driver.setUser(driverUser);
                driver.setLicenseNumber(licenseNumber);
                driver.setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(driver);
            }
        }
    }

    private void seedTrips() {
        if (tripRepository.count() == 0) {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlateIgnoreCase("Actros-X1");
            Optional<Driver> driverOpt = driverRepository.findAll().stream().findFirst();

            if (vehicleOpt.isPresent() && driverOpt.isPresent()) {
                Trip trip = new Trip();
                trip.setVehicle(vehicleOpt.get());
                trip.setDriver(driverOpt.get());
                trip.setStartTime(LocalDateTime.now().minusHours(2));
                trip.setStatus(TripStatus.ACTIVE);
                trip.setDistanceCovered(120.5);
                tripRepository.save(trip);
            }
        }
    }

    private void seedMaintenanceLogs() {
        if (maintenanceLogRepository.count() == 0) {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlateIgnoreCase("Volvo-FH16");
            Optional<SystemUser> techOpt = systemUserRepository.findByUsername("tech1");

            if (vehicleOpt.isPresent() && techOpt.isPresent()) {
                MaintenanceLog log = new MaintenanceLog();
                log.setVehicle(vehicleOpt.get());
                log.setTechnician(techOpt.get());
                log.setServiceDate(LocalDate.now());
                log.setDescription("Initial System Check");
                log.setCost(250.0);
                maintenanceLogRepository.save(log);
            }
        }
    }

    private void seedTelemetry() {
        if (telemetryDataRepository.count() == 0) {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlateIgnoreCase("Actros-X1");
            if (vehicleOpt.isPresent()) {
                TelemetryData data = new TelemetryData();
                data.setVehicle(vehicleOpt.get());
                data.setLatitude(28.6139);
                data.setLongitude(77.2090);
                data.setSpeed(65.5);
                data.setFuelLevel(78.0);
                data.setEngineTemp(85.0);
                data.setRecordedAt(LocalDateTime.now());
                telemetryDataRepository.save(data);
            }
        }
    }
}