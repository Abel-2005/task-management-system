package com.devops.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.devops.authservice.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
