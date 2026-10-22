package com.example.demo.controller;

import com.example.demo.service.MonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    private final MonitoringService monitoringService;

    public MonitoringController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping("/live")
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<List<Map<String, Object>>> getLiveTelemetry() {
        return ResponseEntity.ok(monitoringService.getLiveSnapshot());
    }
}