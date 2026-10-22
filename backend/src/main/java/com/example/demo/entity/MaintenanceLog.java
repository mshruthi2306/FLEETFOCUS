package com.example.demo.entity;

import com.example.demo.config.FlexibleLocalDateDeserializer;
import com.example.demo.config.SystemUserReferenceDeserializer;
import com.example.demo.config.VehicleReferenceDeserializer;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "maintenance_logs")
public class MaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    @JsonDeserialize(using = VehicleReferenceDeserializer.class)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(nullable = false)
    @JsonDeserialize(using = SystemUserReferenceDeserializer.class)
    private SystemUser technician;

    @Column(nullable = false)
    @JsonDeserialize(using = FlexibleLocalDateDeserializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate serviceDate;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double cost;

    public MaintenanceLog() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    @JsonProperty("vehicleId")
    public void setVehicleId(Long vehicleId) {
        if (vehicleId != null) {
            if (this.vehicle == null) {
                this.vehicle = new Vehicle();
            }
            this.vehicle.setId(vehicleId);
        }
    }

    public SystemUser getTechnician() {
        return technician;
    }

    public void setTechnician(SystemUser technician) {
        this.technician = technician;
    }

    @JsonProperty("technicianId")
    public void setTechnicianId(Long technicianId) {
        if (technicianId != null) {
            if (this.technician == null) {
                this.technician = new SystemUser();
            }
            this.technician.setId(technicianId);
        }
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(LocalDate serviceDate) {
        this.serviceDate = serviceDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }
}