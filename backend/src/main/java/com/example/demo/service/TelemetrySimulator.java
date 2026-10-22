package com.example.demo.service;

import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import com.example.demo.repository.TelemetryDataRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class TelemetrySimulator {

    private final VehicleRepository vehicleRepository;
    private final TelemetryDataRepository telemetryDataRepository;

    public TelemetrySimulator(VehicleRepository vehicleRepository,
                               TelemetryDataRepository telemetryDataRepository) {
        this.vehicleRepository = vehicleRepository;
        this.telemetryDataRepository = telemetryDataRepository;
    }

    @Scheduled(fixedRate = 10000)
    public void simulate() {
        List<Vehicle> onTripVehicles = vehicleRepository.findByStatus(VehicleStatus.ON_TRIP);
        for (Vehicle vehicle : onTripVehicles) {
            TelemetryData data = new TelemetryData();
            data.setVehicle(vehicle);
            data.setLatitude(ThreadLocalRandom.current().nextDouble(-90, 90));
            data.setLongitude(ThreadLocalRandom.current().nextDouble(-180, 180));
            data.setSpeed(ThreadLocalRandom.current().nextDouble(0, 120));
            data.setFuelLevel(ThreadLocalRandom.current().nextDouble(0, 100));
            data.setEngineTemp(ThreadLocalRandom.current().nextDouble(70, 110));
            data.setRecordedAt(LocalDateTime.now());
            telemetryDataRepository.save(data);
        }
    }
}