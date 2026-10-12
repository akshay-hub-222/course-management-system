package com.cms.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Simple in-memory session token store (tokens are cleared when the server restarts). */
@Component
public class TokenStore {
    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    public String issue(Long userId) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, userId);
        return token;
    }

    public Long userIdFor(String token) { return token == null ? null : tokens.get(token); }

    public void revoke(String token) { if (token != null) tokens.remove(token); }
}
