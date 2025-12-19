package com.sheetal.icecream.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id")
    private Integer businessId;

    @Column(name = "total_amount")
    private Double totalAmount;

    private String status = "Pending";

    // THIS IS THE MISSING PART:
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    public void addItems(List<OrderItem> newItems) {
        this.items = newItems;
        if (newItems != null) {
            for (OrderItem item : newItems) {
                item.setOrder(this);
            }
        }
    }
}