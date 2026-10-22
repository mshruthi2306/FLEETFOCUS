package com.example.demo.controller;

import com.example.demo.entity.MaintenanceLog;
import com.example.demo.service.MaintenanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('MAINTENANCE_TECH')")
    public ResponseEntity<List<MaintenanceLog>> getAllLogs() {
        return ResponseEntity.ok(maintenanceService.getAllLogs());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('MAINTENANCE_TECH')")
    public ResponseEntity<MaintenanceLog> getLogById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getLogById(id));
    }

    @PostMapping(path = {"", "/log"})
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('MAINTENANCE_TECH')")
    public ResponseEntity<MaintenanceLog> logMaintenance(@RequestBody MaintenanceLog log) {
        return new ResponseEntity<>(maintenanceService.addLog(log), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('MAINTENANCE_TECH')")
    public ResponseEntity<MaintenanceLog> updateLog(@PathVariable Long id, @RequestBody MaintenanceLog log) {
        return ResponseEntity.ok(maintenanceService.updateLog(id, log));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('MAINTENANCE_TECH')")
    public ResponseEntity<Map<String, String>> deleteLog(@PathVariable Long id) {
        maintenanceService.deleteLog(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Maintenance record deleted successfully."));
    }
}