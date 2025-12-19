package com.sheetal.icecream.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name") // Matches SQL item_name
    private String itemName;

    private Integer quantity;
    private Double price;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore // Important: prevents infinite loops when sending JSON
    private Order order;
}