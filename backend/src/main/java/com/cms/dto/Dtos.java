package com.cms.dto;

import com.cms.model.Enrollment;
import com.cms.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class Dtos {

    public record RegisterRequest(
            @NotBlank(message = "Name is required") @Size(max = 100) String name,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
            @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") String email,
            @NotBlank(message = "Password is required") String password) {}

    public record AuthResponse(String token, User user) {}

    public record EnrollmentDto(Long id, Long courseId, String courseCode, String courseTitle,
                                String instructor, Long studentId, String studentName,
                                String studentEmail, LocalDateTime enrolledAt) {
        public static EnrollmentDto from(Enrollment e) {
            return new EnrollmentDto(e.getId(), e.getCourse().getId(), e.getCourse().getCode(),
                    e.getCourse().getTitle(), e.getCourse().getInstructor(), e.getUser().getId(),
                    e.getUser().getName(), e.getUser().getEmail(), e.getEnrolledAt());
        }
    }

    public record StatsDto(long courses, long students, long enrollments) {}
}
