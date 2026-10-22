package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateVinException extends RuntimeException {

    public DuplicateVinException(String message) {
        super(message);
    }
}
