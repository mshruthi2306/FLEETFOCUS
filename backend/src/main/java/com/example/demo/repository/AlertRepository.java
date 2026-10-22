package com.example.demo.repository;

import com.example.demo.entity.Alert;
import com.example.demo.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByVehicle(Vehicle vehicle);

    void deleteByVehicle(Vehicle vehicle);
}