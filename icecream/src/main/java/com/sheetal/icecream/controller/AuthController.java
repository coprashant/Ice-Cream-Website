package com.sheetal.icecream.controller;

import com.sheetal.icecream.model.User;
import com.sheetal.icecream.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        User user = userRepository.findByUsername(username);

        if (user != null && user.getPassword().equals(password)) {
            // Success: Return user details (including role and businessId)
            return ResponseEntity.ok(user);
        } else {
            // Failure: Return 401 Unauthorized
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }
}