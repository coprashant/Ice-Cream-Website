package com.sheetal.icecream.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String password; // In production, we've hash this. For now, plain text is fine.

    @Column(nullable = false)
    private String role; // Stores "ADMIN" or "CUSTOMER"

    @Column(name = "business_id")
    private Integer businessId; // NULL for Admins, has a value for Customers
}