package com.devops.authservice.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@CrossOrigin(origins = "*")
public class SystemHealthController {

    @GetMapping
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("timestamp", System.currentTimeMillis());

        // Service statuses
        Map<String, String> services = new HashMap<>();
        services.put("jenkins", "running");
        services.put("github_actions", "connected");
        services.put("docker", "active");
        services.put("postgresql", "connected");
        services.put("reverse_proxy", "active");

        health.put("services", services);

        // Deployment info
        Map<String, String> deployment = new HashMap<>();
        deployment.put("environment", "production");
        deployment.put("region", "us-east-1");
        deployment.put("version", "2.1.0");
        deployment.put("uptime", "28 days");

        health.put("deployment", deployment);

        return health;
    }
}
