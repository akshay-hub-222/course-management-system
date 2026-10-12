package com.cms.controller;

import com.cms.dto.Dtos.EnrollmentDto;
import com.cms.dto.Dtos.StatsDto;
import com.cms.exception.ApiException;
import com.cms.model.Role;
import com.cms.model.User;
import com.cms.repository.CourseRepository;
import com.cms.repository.EnrollmentRepository;
import com.cms.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository users;
    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;

    public AdminController(UserRepository users, CourseRepository courses, EnrollmentRepository enrollments) {
        this.users = users;
        this.courses = courses;
        this.enrollments = enrollments;
    }

    @GetMapping("/stats")
    public StatsDto stats() {
        return new StatsDto(courses.count(), users.findByRole(Role.STUDENT).size(), enrollments.count());
    }

    @GetMapping("/students")
    public List<User> students() {
        return users.findByRole(Role.STUDENT);
    }

    @GetMapping("/enrollments")
    public List<EnrollmentDto> allEnrollments() {
        return enrollments.findAll().stream().map(EnrollmentDto::from).toList();
    }

    @DeleteMapping("/enrollments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeEnrollment(@PathVariable Long id) {
        if (!enrollments.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Enrollment not found.");
        }
        enrollments.deleteById(id);
    }
}
