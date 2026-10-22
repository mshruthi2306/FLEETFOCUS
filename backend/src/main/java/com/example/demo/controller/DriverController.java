package com.example.demo.controller;

import com.example.demo.entity.Driver;
import com.example.demo.entity.DriverStatus;
import com.example.demo.entity.SystemUser;
import com.example.demo.service.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('DISPATCHER') or hasRole('DRIVER')")
    public ResponseEntity<List<Driver>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getDriversByStatus(DriverStatus.AVAILABLE));
    }

    @GetMapping("/me")
    public ResponseEntity<Driver> getCurrentDriver(@AuthenticationPrincipal SystemUser user) {
        if (user == null && SecurityContextHolder.getContext().getAuthentication() != null) {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof SystemUser) {
                user = (SystemUser) principal;
            }
        }
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        Driver driver = driverService.getOrCreateDriverForUser(user);
        return ResponseEntity.ok(driver);
    }
}