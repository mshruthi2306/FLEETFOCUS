package com.example.demo.service;

import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterRequestDto;
import com.example.demo.entity.SystemUser;
import com.example.demo.entity.UserRole;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final SystemUserRepository systemUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(JwtService jwtService, SystemUserRepository systemUserRepository, PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.systemUserRepository = systemUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthService(JwtService jwtService) {
        this(jwtService, null, null);
    }

    public AuthResponseDto generateAuthResponse(SystemUser user) {
        String token = jwtService.generateToken(user);
        return new AuthResponseDto(token, user.getUsername(), user.getRole().name());
    }

    public AuthResponseDto register(RegisterRequestDto request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new BusinessValidationException("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new BusinessValidationException("Password is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BusinessValidationException("Email is required");
        }
        if (systemUserRepository != null && systemUserRepository.existsByUsername(request.getUsername().trim())) {
            throw new BusinessValidationException("Username already exists");
        }
        if (systemUserRepository != null && systemUserRepository.existsByEmail(request.getEmail().trim())) {
            throw new BusinessValidationException("Email already exists");
        }

        UserRole role = UserRole.DRIVER;
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                role = UserRole.valueOf(request.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        String encodedPassword = passwordEncoder != null
                ? passwordEncoder.encode(request.getPassword())
                : request.getPassword();

        SystemUser newUser = new SystemUser(
                request.getUsername().trim(),
                encodedPassword,
                request.getEmail().trim(),
                role
        );

        SystemUser saved = systemUserRepository != null ? systemUserRepository.save(newUser) : newUser;
        return generateAuthResponse(saved);
    }
}