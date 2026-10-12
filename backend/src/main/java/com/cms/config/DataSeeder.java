package com.cms.config;

import com.cms.model.Course;
import com.cms.model.Role;
import com.cms.model.User;
import com.cms.repository.CourseRepository;
import com.cms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Creates a default admin account and a few sample courses on first run. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final CourseRepository courses;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, CourseRepository courses, PasswordEncoder encoder) {
        this.users = users;
        this.courses = courses;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (!users.existsByEmail("admin@cms.com")) {
            User admin = new User();
            admin.setName("Administrator");
            admin.setEmail("admin@cms.com");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            users.save(admin);
        }
        if (courses.count() == 0) {
            courses.save(make("CS101", "Java Programming Fundamentals", "Core Java: syntax, OOP, collections and exceptions.", "Dr. Anita Rao", "8 weeks", 4, 40, "Programming", "Beginner"));
            courses.save(make("CS201", "Spring Boot & REST APIs", "Build REST services with Spring Boot, JPA and MySQL.", "Prof. Kiran Kumar", "6 weeks", 3, 30, "Backend", "Intermediate"));
            courses.save(make("CS202", "React for Beginners", "Components, hooks, routing and state management with React.", "Ms. Sneha Reddy", "5 weeks", 3, 35, "Web Development", "Beginner"));
            courses.save(make("DB101", "MySQL Database Design", "Relational modelling, SQL queries, indexing and normalization.", "Mr. Ravi Teja", "4 weeks", 2, 25, "Data & Databases", "Intermediate"));
            courses.save(make("WD110", "HTML, CSS & JavaScript", "Build responsive web pages from scratch.", "Ms. Priya Sharma", "6 weeks", 3, 45, "Web Development", "Beginner"));
        }
        backfill();
    }

    private Course make(String code, String title, String desc, String instructor, String duration, int credits, int capacity, String category, String level) {
        Course c = new Course();
        c.setCategory(category);
        c.setLevel(level);
        c.setCode(code);
        c.setTitle(title);
        c.setDescription(desc);
        c.setInstructor(instructor);
        c.setDuration(duration);
        c.setCredits(credits);
        c.setCapacity(capacity);
        return c;
    }

    /** Adds category/level to the sample courses of databases created before these columns existed. */
    private void backfill() {
        for (Course c : courses.findAll()) {
            if (c.getCategory() != null) continue;
            switch (c.getCode()) {
                case "CS101" -> { c.setCategory("Programming"); c.setLevel("Beginner"); }
                case "CS201" -> { c.setCategory("Backend"); c.setLevel("Intermediate"); }
                case "CS202", "WD110" -> { c.setCategory("Web Development"); c.setLevel("Beginner"); }
                case "DB101" -> { c.setCategory("Data & Databases"); c.setLevel("Intermediate"); }
                default -> { continue; }
            }
            courses.save(c);
        }
    }
}
