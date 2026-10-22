package com.example.demo.controller;

import com.example.demo.dto.EndTripRequestDto;
import com.example.demo.dto.StartTripRequestDto;
import com.example.demo.entity.Driver;
import com.example.demo.entity.SystemUser;
import com.example.demo.entity.Trip;
import com.example.demo.entity.UserRole;
import com.example.demo.service.DriverService;
import com.example.demo.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;
    private final DriverService driverService;

    @Autowired
    public TripController(TripService tripService, DriverService driverService) {
        this.tripService = tripService;
        this.driverService = driverService;
    }

    public TripController(TripService tripService) {
        this(tripService, null);
    }

    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips(@AuthenticationPrincipal SystemUser user) {
        if (user == null && SecurityContextHolder.getContext().getAuthentication() != null) {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof SystemUser) {
                user = (SystemUser) principal;
            }
        }
        if (user != null && user.getRole() == UserRole.DRIVER) {
            return ResponseEntity.ok(tripService.getTripsForDriverUser(user));
        }
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @PostMapping("/start")
    public ResponseEntity<Trip> startTrip(@RequestBody StartTripRequestDto request, @AuthenticationPrincipal SystemUser user) {
        if (user == null && SecurityContextHolder.getContext().getAuthentication() != null) {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof SystemUser) {
                user = (SystemUser) principal;
            }
        }
        Long driverId = request.getDriverId();
        if (driverId == null && user != null && user.getRole() == UserRole.DRIVER && driverService != null) {
            Driver driver = driverService.getOrCreateDriverForUser(user);
            if (driver != null) {
                driverId = driver.getId();
            }
        }
        return ResponseEntity.ok(tripService.startTrip(request.getVehicleId(), driverId));
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<Trip> endTrip(@PathVariable Long id, @RequestBody EndTripRequestDto request) {
        return ResponseEntity.ok(tripService.endTrip(id, request.getDistance()));
    }
}