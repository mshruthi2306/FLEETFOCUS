package com.example.demo.service;

import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Vehicle;
import com.example.demo.repository.TelemetryDataRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MonitoringService {

    private final VehicleRepository vehicleRepository;
    private final TelemetryDataRepository telemetryDataRepository;

    public MonitoringService(VehicleRepository vehicleRepository,
                              TelemetryDataRepository telemetryDataRepository) {
        this.vehicleRepository = vehicleRepository;
        this.telemetryDataRepository = telemetryDataRepository;
    }

    public List<Map<String, Object>> getLiveSnapshot() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        return vehicles.stream().map(vehicle -> {
            Map<String, Object> snapshot = new LinkedHashMap<>();
            snapshot.put("vehicleId", vehicle.getId());
            snapshot.put("licensePlate", vehicle.getLicensePlate());
            snapshot.put("status", vehicle.getStatus());

            List<TelemetryData> latest = telemetryDataRepository.findByVehicleOrderByRecordedAtDesc(vehicle);
            if (!latest.isEmpty()) {
                TelemetryData t = latest.get(0);
                snapshot.put("latitude", t.getLatitude());
                snapshot.put("longitude", t.getLongitude());
                snapshot.put("speed", t.getSpeed());
                snapshot.put("fuelLevel", t.getFuelLevel());
                snapshot.put("engineTemp", t.getEngineTemp());
                snapshot.put("recordedAt", t.getRecordedAt());
            }
            return snapshot;
        }).toList();
    }
}