package com.sheetal.icecream.repository;

import com.sheetal.icecream.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// This interface gives you all the commands like save, delete, and find
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}