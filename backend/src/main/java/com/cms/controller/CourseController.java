package com.cms.controller;

import com.cms.exception.ApiException;
import com.cms.model.Course;
import com.cms.repository.CourseRepository;
import com.cms.repository.EnrollmentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;

    public CourseController(CourseRepository courses, EnrollmentRepository enrollments) {
        this.courses = courses;
        this.enrollments = enrollments;
    }

    private Course withCount(Course c) {
        c.setEnrolledCount(enrollments.countByCourseId(c.getId()));
        return c;
    }

    @GetMapping
    public List<Course> list(@RequestParam(required = false) String q) {
        List<Course> result = (q == null || q.isBlank())
                ? courses.findAll()
                : courses.findByTitleContainingIgnoreCaseOrCodeContainingIgnoreCaseOrInstructorContainingIgnoreCase(q, q, q);
        result.forEach(this::withCount);
        return result;
    }

    @GetMapping("/{id}")
    public Course get(@PathVariable Long id) {
        return withCount(courses.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found.")));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Course create(@Valid @RequestBody Course course) {
        if (courses.existsByCodeIgnoreCase(course.getCode())) {
            throw new ApiException(HttpStatus.CONFLICT, "A course with code " + course.getCode() + " already exists.");
        }
        course.setId(null);
        return withCount(courses.save(course));
    }

    @PutMapping("/{id}")
    public Course update(@PathVariable Long id, @Valid @RequestBody Course in) {
        Course c = courses.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found."));
        if (courses.existsByCodeIgnoreCaseAndIdNot(in.getCode(), id)) {
            throw new ApiException(HttpStatus.CONFLICT, "A course with code " + in.getCode() + " already exists.");
        }
        long enrolled = enrollments.countByCourseId(id);
        if (in.getCapacity() < enrolled) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Capacity cannot be lower than the " + enrolled + " students already enrolled.");
        }
        c.setCode(in.getCode());
        c.setTitle(in.getTitle());
        c.setDescription(in.getDescription());
        c.setInstructor(in.getInstructor());
        c.setDuration(in.getDuration());
        c.setCategory(in.getCategory());
        c.setLevel(in.getLevel());
        c.setImageUrl(in.getImageUrl());
        c.setCredits(in.getCredits());
        c.setCapacity(in.getCapacity());
        return withCount(courses.save(c));
    }

    @DeleteMapping("/{id}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!courses.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Course not found.");
        }
        enrollments.deleteByCourseId(id);
        courses.deleteById(id);
    }
}
