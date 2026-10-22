package com.example.demo.controller;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterRequestDto;
import com.example.demo.entity.Driver;
import com.example.demo.entity.DriverStatus;
import com.example.demo.entity.SystemUser;
import com.example.demo.entity.UserRole;
import com.example.demo.repository.DriverRepository;
import com.example.demo.repository.SystemUserRepository;
import com.example.demo.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final SystemUserRepository systemUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final DriverRepository driverRepository;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,
                          AuthService authService,
                          SystemUserRepository systemUserRepository,
                          PasswordEncoder passwordEncoder,
                          DriverRepository driverRepository) {
        this.authenticationManager = authenticationManager;
        this.authService = authService;
        this.systemUserRepository = systemUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.driverRepository = driverRepository;
    }

    public AuthController(AuthenticationManager authenticationManager,
                          AuthService authService,
                          SystemUserRepository systemUserRepository,
                          PasswordEncoder passwordEncoder) {
        this(authenticationManager, authService, systemUserRepository, passwordEncoder, null);
    }

    public AuthController(AuthenticationManager authenticationManager, AuthService authService) {
        this(authenticationManager, authService, null, null, null);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDto request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SystemUser user = (SystemUser) auth.getPrincipal();
            AuthResponseDto response = authService.generateAuthResponse(user);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto request) {
        if (request == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Request body is missing"));
        }

        String username = request.getUsername();
        String email = request.getEmail();
        String password = request.getPassword();
        String roleStr = request.getRole();

        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Username cannot be empty"));
        }
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Email cannot be empty"));
        }
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Password cannot be empty"));
        }

        // Validate role matches existing UserRole enum values
        UserRole role;
        if (roleStr == null || roleStr.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Role is required"));
        }
        try {
            role = UserRole.valueOf(roleStr.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Invalid role: " + roleStr));
        }

        // Check if username already exists -> 409 Conflict
        if (systemUserRepository.findByUsername(username.trim()).isPresent() ||
            systemUserRepository.existsByUsername(username.trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("message", "Username already exists"));
        }

        // Check if email already exists -> 409 Conflict
        if (systemUserRepository.findByEmail(email.trim()).isPresent() ||
            systemUserRepository.existsByEmail(email.trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("message", "Email already exists"));
        }

        // Hash the password using existing PasswordEncoder bean
        String hashedPassword = passwordEncoder.encode(password);

        // Save new SystemUser
        SystemUser newUser = new SystemUser(username.trim(), hashedPassword, email.trim(), role);
        newUser = systemUserRepository.save(newUser);

        if (role == UserRole.DRIVER && driverRepository != null) {
            String baseLic = "DL-" + username.trim().toUpperCase();
            String finalLic = driverRepository.findAll().stream().anyMatch(d -> baseLic.equalsIgnoreCase(d.getLicenseNumber()))
                    ? "DL-" + newUser.getId() + "-" + (System.currentTimeMillis() % 10000)
                    : baseLic;
            Driver driver = new Driver();
            driver.setUser(newUser);
            driver.setLicenseNumber(finalLic);
            driver.setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(driver);
        }

        // On success, return 201 Created with confirmation message
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "User registered successfully"));
    }
}