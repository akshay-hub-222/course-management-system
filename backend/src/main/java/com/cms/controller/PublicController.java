package com.cms.controller;

import com.cms.model.Course;
import com.cms.repository.CourseRepository;
import com.cms.repository.EnrollmentRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Read-only course catalogue for visitors who have not logged in yet (landing page / explorer). */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;

    public PublicController(CourseRepository courses, EnrollmentRepository enrollments) {
        this.courses = courses;
        this.enrollments = enrollments;
    }

    @GetMapping("/courses")
    public List<Course> courses() {
        List<Course> result = courses.findAll();
        result.forEach(c -> c.setEnrolledCount(enrollments.countByCourseId(c.getId())));
        return result;
    }
}
