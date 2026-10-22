package com.example.demo.repository;

import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByStatus(VehicleStatus status);

    Optional<Vehicle> findByLicensePlate(String licensePlate);

    Optional<Vehicle> findByLicensePlateIgnoreCase(String licensePlate);

    Optional<Vehicle> findByVin(String vin);
}