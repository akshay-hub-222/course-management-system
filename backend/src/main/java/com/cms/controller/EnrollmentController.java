package com.cms.controller;

import com.cms.dto.Dtos.EnrollmentDto;
import com.cms.exception.ApiException;
import com.cms.model.Course;
import com.cms.model.Enrollment;
import com.cms.model.User;
import com.cms.repository.CourseRepository;
import com.cms.repository.EnrollmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentRepository enrollments;
    private final CourseRepository courses;

    public EnrollmentController(EnrollmentRepository enrollments, CourseRepository courses) {
        this.enrollments = enrollments;
        this.courses = courses;
    }

    @GetMapping("/my")
    public List<EnrollmentDto> mine(@RequestAttribute("currentUser") User user) {
        return enrollments.findByUserId(user.getId()).stream().map(EnrollmentDto::from).toList();
    }

    @PostMapping("/{courseId}")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentDto enroll(@PathVariable Long courseId, @RequestAttribute("currentUser") User user) {
        Course course = courses.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found."));
        if (enrollments.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new ApiException(HttpStatus.CONFLICT, "You are already enrolled in this course.");
        }
        if (enrollments.countByCourseId(courseId) >= course.getCapacity()) {
            throw new ApiException(HttpStatus.CONFLICT, "This course is full.");
        }
        return EnrollmentDto.from(enrollments.save(new Enrollment(user, course)));
    }

    @DeleteMapping("/{courseId}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void drop(@PathVariable Long courseId, @RequestAttribute("currentUser") User user) {
        Enrollment e = enrollments.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "You are not enrolled in this course."));
        enrollments.delete(e);
    }
}
