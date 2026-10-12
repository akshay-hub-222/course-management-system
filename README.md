# Learnify – Course Management System

A full stack web application for managing courses and student enrollments.

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React 18, React Router, Vite                 |
| Backend   | Java 17, Spring Boot 3.2, Spring Data JPA / Hibernate |
| Database  | MySQL 8                                      |
| API       | RESTful JSON, token-based login, BCrypt passwords |

## Features
**Administrator** – add, edit, delete courses; view all enrollments and remove them; view registered students; dashboard counts.
**Student** – register, log in, search and browse courses, enroll (seat limits enforced, no duplicates), drop courses, see "My courses".

## Prerequisites
- JDK 17+
- Maven 3.8+
- Node.js 18+ and npm
- MySQL 8 running on `localhost:3306`

## 1. Database
The database `course_management` is created automatically on first run (`createDatabaseIfNotExist=true`) and Hibernate creates the tables.
Edit the MySQL username/password in `backend/src/main/resources/application.properties` (default user: `root`).
No SQL script is needed. Replace `YOUR_MYSQL_PASSWORD` with your own password.

## 2. Backend
```bash
cd backend
mvn spring-boot:run
```
Runs on http://localhost:8080. On first start it seeds:
- Admin account: **admin@cms.com / admin123**
- 5 sample courses

## 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Vite proxies `/api` calls to the backend.

## REST API
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | public | Register a student |
| POST | `/api/auth/login` | public | Log in, returns token + user |
| POST | `/api/auth/logout` | public | Invalidate token |
| GET | `/api/public/courses` | public | Read-only course catalogue (landing page and explorer for visitors) |
| GET | `/api/courses?q=` | logged in | List / search courses |
| GET | `/api/courses/{id}` | logged in | Course details |
| POST | `/api/courses` | admin | Add course |
| PUT | `/api/courses/{id}` | admin | Update course |
| DELETE | `/api/courses/{id}` | admin | Delete course (and its enrollments) |
| GET | `/api/enrollments/my` | logged in | My enrollments |
| POST | `/api/enrollments/{courseId}` | logged in | Enroll |
| DELETE | `/api/enrollments/{courseId}` | logged in | Drop |
| GET | `/api/admin/stats` | admin | Totals |
| GET | `/api/admin/students` | admin | All students |
| GET | `/api/admin/enrollments` | admin | All enrollments |
| DELETE | `/api/admin/enrollments/{id}` | admin | Remove an enrollment |

Send the token as `Authorization: Bearer <token>`.

## Project structure
```
course-management-system/
├── backend/    Spring Boot (model, repository, controller, security, config, exception, dto)
├── frontend/   React app (pages, components, AuthContext, api helper)
└── README.md
```

## Frontend pages
| Route | Access | Page |
|-------|--------|------|
| `/` | public | Landing page (hero, featured courses, categories, benefits) |
| `/courses` | public (enroll needs login) | Course explorer: search, category / level / availability filters, sorting |
| `/dashboard` | student | Welcome, stats, continue-learning cards, suggestions |
| `/my-courses` | student | Enrolled courses |
| `/admin` | admin | Analytics overview (KPIs and charts from live data) |
| `/admin/courses` | admin | Course table with search, filters, add / edit / delete |
| `/admin/enrollments`, `/admin/students` | admin | Searchable tables |

Courses now have optional `category`, `level` and `imageUrl` fields (Hibernate adds the columns automatically). When no image URL is set, an illustration is generated from the category. Ratings and completion progress are intentionally not shown because the database does not store them.

## Notes
- Login tokens are kept in server memory, so users must log in again after a backend restart.
- For production, switch to JWT/Spring Security, move DB credentials to environment variables, and set `ddl-auto=validate`.

## Future extensions
Study materials, assignments, quizzes and student progress tracking can be added as new entities and endpoints following the same controller/repository pattern.
