package com.devops.authservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.devops.authservice.dto.SignupRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.devops.authservice.entity.AppUser;
import com.devops.authservice.repository.AppUserRepository;

@RestController
public class HelloController {
    private final AppUserRepository appUserRepository;

    public HelloController(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @GetMapping("/hello")
    public String hello() {
        return "Auth Service is Running!";
    }

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) {

        AppUser user = new AppUser();

        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());

        appUserRepository.save(user);

        return "User saved successfully!";
    }
}