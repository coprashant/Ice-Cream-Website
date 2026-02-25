package com.sheetal.icecream.controller;

import com.sheetal.icecream.model.Order;
import com.sheetal.icecream.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // This is CRITICAL: It allows your website to talk to your Java code
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/place")
public Order placeOrder(@RequestBody Order order) {
    // 1. Link the items to the order object
    if (order.getItems() != null) {
        order.addItems(order.getItems());
    }
    // 2. Save once and return the result
    return orderRepository.save(order);
}
}