package com.sheetal.icecream.repository;

import com.sheetal.icecream.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // This magic method lets us find a user by their username automatically!
    User findByUsername(String username);
}