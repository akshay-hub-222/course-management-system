import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseArt from './CourseArt.jsx';
import Icon from './Icon.jsx';
import { initials, isFull, seatsLeft } from '../lib.js';

/** Course details drawer used by the explorer and dashboards. */
export default function CourseModal({ course, user, enrolled, busy, onClose, onEnroll, onDrop }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const full = isFull(course);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog dialog-lg" role="dialog" aria-modal="true" aria-label={course.title} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn dialog-close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        <CourseArt course={course} className="art-wide" />
        <div className="dialog-body">
          <div className="ccard-meta">
            {course.category && <span className="tag">{course.category}</span>}
            {course.level && <span className={`level level-${course.level.toLowerCase()}`}>{course.level}</span>}
            <span className="ccard-code">{course.code}</span>
          </div>
          <h2 className="dialog-title">{course.title}</h2>
          <p className="dialog-text">{course.description || 'No description has been added for this course yet.'}</p>

          <div className="detail-grid">
            <div><span>Instructor</span><strong className="inline"><span className="avatar avatar-sm">{initials(course.instructor)}</span>{course.instructor}</strong></div>
            <div><span>Duration</span><strong>{course.duration || 'Self-paced'}</strong></div>
            <div><span>Credits</span><strong>{course.credits}</strong></div>
            <div><span>Seats</span><strong>{full ? 'Full' : `${seatsLeft(course)} of ${course.capacity} left`}</strong></div>
          </div>

          <div className="dialog-actions">
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            {isAdmin ? (
              <Link className="btn btn-primary" to="/admin/courses">Manage in admin</Link>
            ) : !user ? (
              <Link className="btn btn-primary" to="/login" state={{ from: '/courses' }}>Log in to enroll</Link>
            ) : enrolled ? (
              <button className="btn btn-soft" disabled={busy} onClick={() => onDrop(course)}>Drop course</button>
            ) : (
              <button className="btn btn-primary" disabled={full || busy} onClick={() => onEnroll(course)}>{full ? 'Course full' : 'Enroll now'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
