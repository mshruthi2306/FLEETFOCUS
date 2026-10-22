package com.example.demo.config;

import com.example.demo.entity.Vehicle;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;

public class VehicleReferenceDeserializer extends JsonDeserializer<Vehicle> {

    @Override
    public Vehicle deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        if (node == null || node.isNull()) {
            return null;
        }

        Vehicle vehicle = new Vehicle();
        if (node.isNumber()) {
            vehicle.setId(node.asLong());
            return vehicle;
        }

        if (node.isTextual()) {
            String text = node.asText().trim();
            try {
                vehicle.setId(Long.parseLong(text));
            } catch (NumberFormatException e) {
                // If it's not a numeric ID, treat as license plate
                vehicle.setLicensePlate(text);
            }
            return vehicle;
        }

        if (node.isObject()) {
            if (node.has("id") && !node.get("id").isNull()) {
                vehicle.setId(node.get("id").asLong());
            }
            if (node.has("licensePlate") && !node.get("licensePlate").isNull()) {
                vehicle.setLicensePlate(node.get("licensePlate").asText().trim());
            }
            if (node.has("vin") && !node.get("vin").isNull()) {
                vehicle.setVin(node.get("vin").asText().trim());
            }
            if (node.has("model") && !node.get("model").isNull()) {
                vehicle.setModel(node.get("model").asText().trim());
            }
            return vehicle;
        }

        return null;
    }
}
