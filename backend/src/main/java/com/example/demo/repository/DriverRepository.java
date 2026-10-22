package com.example.demo.repository;

import com.example.demo.entity.Driver;
import com.example.demo.entity.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    List<Driver> findByStatus(DriverStatus status);
}