package com.cms.security;

import com.cms.model.Role;
import com.cms.model.User;
import com.cms.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

/**
 * Rules:
 *  - /api/auth/**                       public
 *  - GET /api/public/**                 public (read-only course catalogue)
 *  - /api/admin/**                      ADMIN only
 *  - POST/PUT/DELETE /api/courses/**    ADMIN only
 *  - everything else under /api/**      any logged-in user
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final TokenStore tokenStore;
    private final UserRepository userRepository;

    public AuthInterceptor(TokenStore tokenStore, UserRepository userRepository) {
        this.tokenStore = tokenStore;
        this.userRepository = userRepository;
    }

    public static String extractToken(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        return (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws IOException {
        String method = req.getMethod();
        String path = req.getRequestURI();

        if ("OPTIONS".equalsIgnoreCase(method) || path.startsWith("/api/auth/")
                || (path.startsWith("/api/public/") && "GET".equalsIgnoreCase(method))) return true;

        Long userId = tokenStore.userIdFor(extractToken(req));
        User user = userId == null ? null : userRepository.findById(userId).orElse(null);
        if (user == null) {
            return deny(res, 401, "Please log in to continue.");
        }
        req.setAttribute("currentUser", user);

        boolean adminOnly = path.startsWith("/api/admin")
                || (path.startsWith("/api/courses") && !"GET".equalsIgnoreCase(method));
        if (adminOnly && user.getRole() != Role.ADMIN) {
            return deny(res, 403, "Only administrators can do this.");
        }
        return true;
    }

    private boolean deny(HttpServletResponse res, int status, String message) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.getWriter().write("{\"message\":\"" + message + "\"}");
        return false;
    }
}
