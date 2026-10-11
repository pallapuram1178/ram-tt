package com.servicedesk.pro.repository;

import com.servicedesk.pro.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(String userId);

    long countByRecipient_IdAndIsReadFalse(String userId);
}
