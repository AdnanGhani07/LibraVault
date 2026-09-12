package com.libravault.audit;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class AuditEvent {

    private final Long actorId;
    private final String actorEmail;
    private final String action;
    private final String targetType;
    private final Long targetId;
    private final String details;
    private final Instant timestamp;
}
