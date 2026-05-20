package com.devops.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.devops.authservice.entity.ActivityLog;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    @Query(value = "SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT :limit", nativeQuery = true)
    List<ActivityLog> findRecent(int limit);
}
