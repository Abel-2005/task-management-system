package com.devops.authservice.controller;

import com.devops.authservice.entity.Task;
import com.devops.authservice.entity.ActivityLog;
import com.devops.authservice.repository.TaskRepository;
import com.devops.authservice.repository.ActivityLogRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;

    public TaskController(TaskRepository taskRepository, ActivityLogRepository activityLogRepository) {
        this.taskRepository = taskRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping
    public List<Task> getTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/{id}")
    public Task getTask(@PathVariable Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        task.setStatus("PENDING");
        Task saved = taskRepository.save(task);

        // Log activity
        ActivityLog log = new ActivityLog(
                "CREATED",
                "TASK",
                "Task '" + task.getTitle() + "' created");
        activityLogRepository.save(log);

        return saved;
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task taskUpdate) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));

        if (taskUpdate.getTitle() != null) {
            task.setTitle(taskUpdate.getTitle());
        }
        if (taskUpdate.getStatus() != null) {
            String oldStatus = task.getStatus();
            task.setStatus(taskUpdate.getStatus());

            // Log status change
            ActivityLog log = new ActivityLog(
                    "STATUS_CHANGED",
                    "TASK",
                    "Task '" + task.getTitle() + "' changed from " + oldStatus + " to " + taskUpdate.getStatus());
            activityLogRepository.save(log);
        }

        return taskRepository.save(task);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        String title = task.getTitle();
        taskRepository.deleteById(id);

        // Log activity
        ActivityLog log = new ActivityLog(
                "DELETED",
                "TASK",
                "Task '" + title + "' deleted");
        activityLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Task deleted successfully");
        response.put("id", id);
        return response;
    }

    // Mock DevOps Actions
    @PostMapping("/action/build")
    public Map<String, Object> triggerBuild() {
        ActivityLog log = new ActivityLog(
                "BUILD_STARTED",
                "BUILD",
                "Build pipeline #" + (100 + (int) (Math.random() * 900)) + " started");
        activityLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "building");
        response.put("message", "Build pipeline triggered");
        response.put("buildId", "BUILD-" + System.currentTimeMillis());

        // Simulate build completion after 3 seconds
        new Thread(() -> {
            try {
                Thread.sleep(3000);
                ActivityLog completionLog = new ActivityLog(
                        "BUILD_COMPLETED",
                        "BUILD",
                        "Build pipeline completed successfully");
                activityLogRepository.save(completionLog);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return response;
    }

    @PostMapping("/action/deploy")
    public Map<String, Object> triggerDeploy() {
        ActivityLog log = new ActivityLog(
                "DEPLOY_STARTED",
                "DEPLOY",
                "Deployment to production initiated");
        activityLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "deploying");
        response.put("message", "Deployment pipeline triggered");
        response.put("deploymentId", "DEPLOY-" + System.currentTimeMillis());

        // Simulate deployment completion after 4 seconds
        new Thread(() -> {
            try {
                Thread.sleep(4000);
                ActivityLog completionLog = new ActivityLog(
                        "DEPLOY_COMPLETED",
                        "DEPLOY",
                        "Deployment completed. App v2.1 live in production");
                activityLogRepository.save(completionLog);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return response;
    }

    @PostMapping("/action/database")
    public Map<String, Object> triggerDatabaseCheck() {
        ActivityLog log = new ActivityLog(
                "DATABASE_CHECK",
                "DATABASE",
                "PostgreSQL backup verification completed");
        activityLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "verified");
        response.put("message", "Database check completed");
        response.put("database", "postgresql");
        return response;
    }

    @PostMapping("/action/health")
    public Map<String, Object> triggerHealthCheck() {
        ActivityLog log = new ActivityLog(
                "SYSTEM_HEALTHY",
                "SYSTEM",
                "System health check passed for all services");
        activityLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("message", "System health check completed");
        response.put("services", List.of("auth-service", "frontend", "reverse-proxy", "database"));
        return response;
    }
}
