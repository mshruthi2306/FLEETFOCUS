package com.example.demo.repository;

import com.example.demo.entity.TelemetryData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TelemetryRepository extends JpaRepository<TelemetryData, Long> {

    Optional<TelemetryData> findTopByVehicleIdOrderByRecordedAtDesc(Long vehicleId);
}