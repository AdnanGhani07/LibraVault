package com.libravault.audit;

import com.libravault.dto.audit.AuditLogResponse;
import com.libravault.dto.common.PageResponse;
import com.libravault.model.entity.AuditLog;
import com.libravault.model.entity.User;
import com.libravault.repository.AuditLogRepository;
import com.libravault.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordEvent(AuditEvent event) {
        User actor = null;
        if (event.getActorId() != null) {
            actor = userRepository.findById(event.getActorId()).orElse(null);
        }

        AuditLog auditLog = AuditLog.builder()
                .actor(actor)
                .actorEmail(event.getActorEmail())
                .action(event.getAction())
                .targetType(event.getTargetType())
                .targetId(event.getTargetId())
                .details(event.getDetails())
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : Instant.now())
                .build();

        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAllAuditLogs(Pageable pageable) {
        Page<AuditLogResponse> page = auditLogRepository.findAllByOrderByTimestampDesc(pageable)
                .map(AuditLogResponse::from);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getLogsByTarget(String targetType, Long targetId, Pageable pageable) {
        Page<AuditLogResponse> page = auditLogRepository
                .findByTargetTypeAndTargetIdOrderByTimestampDesc(targetType, targetId, pageable)
                .map(AuditLogResponse::from);
        return PageResponse.from(page);
    }
}
