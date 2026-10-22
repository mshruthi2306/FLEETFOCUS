package com.example.demo.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

public class FlexibleLocalDateDeserializer extends JsonDeserializer<LocalDate> {

    private static final List<DateTimeFormatter> FORMATTERS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,                    // 2026-09-12
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),           // 12-09-2026
            DateTimeFormatter.ofPattern("d-M-yyyy"),             // 1-9-2026
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),           // 12/09/2026
            DateTimeFormatter.ofPattern("d/M/yyyy"),             // 1/9/2026
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),           // 2026/09/12
            DateTimeFormatter.ofPattern("MM-dd-yyyy"),           // 09-12-2026
            DateTimeFormatter.ofPattern("MM/dd/yyyy")            // 09/12/2026
    );

    @Override
    public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null) {
            return null;
        }
        text = text.trim();
        if (text.isEmpty()) {
            return null;
        }

        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDate.parse(text, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        throw new IllegalArgumentException("Unable to parse date '" + text + "'. Expected formats: YYYY-MM-DD or DD-MM-YYYY.");
    }
}
