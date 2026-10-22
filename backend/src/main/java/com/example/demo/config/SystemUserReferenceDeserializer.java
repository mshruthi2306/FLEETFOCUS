package com.example.demo.config;

import com.example.demo.entity.SystemUser;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;

public class SystemUserReferenceDeserializer extends JsonDeserializer<SystemUser> {

    @Override
    public SystemUser deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        if (node == null || node.isNull()) {
            return null;
        }

        SystemUser user = new SystemUser();
        if (node.isNumber()) {
            user.setId(node.asLong());
            return user;
        }

        if (node.isTextual()) {
            String text = node.asText().trim();
            try {
                user.setId(Long.parseLong(text));
            } catch (NumberFormatException e) {
                // If not numeric, treat as username
                user.setUsername(text);
            }
            return user;
        }

        if (node.isObject()) {
            if (node.has("id") && !node.get("id").isNull()) {
                user.setId(node.get("id").asLong());
            }
            if (node.has("username") && !node.get("username").isNull()) {
                user.setUsername(node.get("username").asText().trim());
            }
            if (node.has("email") && !node.get("email").isNull()) {
                user.setEmail(node.get("email").asText().trim());
            }
            return user;
        }

        return null;
    }
}
