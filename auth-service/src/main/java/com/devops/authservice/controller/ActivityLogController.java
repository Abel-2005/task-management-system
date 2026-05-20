package com.devops.authservice.controller;

import com.devops.authservice.entity.ActivityLog;
import com.devops.authservice.repository.ActivityLogRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/activity")
@CrossOrigin(origins = "*")
public class ActivityLogController {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogController(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping
    public List<ActivityLog> getRecentActivity(
            @RequestParam(defaultValue = "20") int limit) {
        return activityLogRepository.findRecent(limit);
    }
}
