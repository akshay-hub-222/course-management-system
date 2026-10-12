import { Link } from 'react-router-dom';
import CourseArt from './CourseArt.jsx';
import Icon from './Icon.jsx';
import { initials, isFull, seatsLeft } from '../lib.js';

export default function CourseCard({ course, user, enrolled, busy, onEnroll, onDrop, onOpen, readOnly }) {
  const full = isFull(course);
  const pct = Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100));
  const left = seatsLeft(course);
  const isAdmin = user?.role === 'ADMIN';

  let action;
  if (readOnly) {
    action = <Link className="btn btn-soft btn-block" to="/courses">View course <Icon name="arrow" size={16} /></Link>;
  } else if (isAdmin) {
    action = <Link className="btn btn-soft btn-block" to="/admin/courses">Manage course</Link>;
  } else if (!user) {
    action = <Link className="btn btn-primary btn-block" to="/login" state={{ from: '/courses' }}>{full ? 'Log in to view' : 'Log in to enroll'}</Link>;
  } else if (enrolled) {
    action = (
      <button className="btn btn-soft btn-block" disabled={busy} onClick={() => onDrop(course)}>
        {busy ? 'Working…' : 'Drop course'}
      </button>
    );
  } else {
    action = (
      <button className="btn btn-primary btn-block" disabled={full || busy} onClick={() => onEnroll(course)}>
        {full ? 'Course full' : busy ? 'Enrolling…' : 'Enroll now'}
      </button>
    );
  }

  return (
    <article className="ccard">
      <button type="button" className="ccard-media" onClick={() => onOpen?.(course)} aria-label={`View details for ${course.title}`}>
        <CourseArt course={course} />
        {course.category && <span className="tag tag-glass">{course.category}</span>}
        {enrolled && <span className="status status-ok"><Icon name="check" size={13} strokeWidth={2.6} /> Enrolled</span>}
        {!enrolled && full && <span className="status status-full">Full</span>}
      </button>

      <div className="ccard-body">
        <div className="ccard-meta">
          {course.level && <span className={`level level-${course.level.toLowerCase()}`}>{course.level}</span>}
          <span className="ccard-code">{course.code}</span>
        </div>
        <h3 className="ccard-title">
          <button type="button" onClick={() => onOpen?.(course)}>{course.title}</button>
        </h3>
        <p className="ccard-desc">{course.description || 'No description added yet.'}</p>

        <div className="ccard-instructor">
          <span className="avatar avatar-sm">{initials(course.instructor)}</span>
          <span>{course.instructor}</span>
        </div>

        <ul className="ccard-facts">
          <li><Icon name="clock" size={15} /> {course.duration || 'Self-paced'}</li>
          <li><Icon name="award" size={15} /> {course.credits} credit{course.credits === 1 ? '' : 's'}</li>
          <li><Icon name="users" size={15} /> {course.enrolledCount} enrolled</li>
        </ul>
      </div>

      <div className="ccard-foot">
        <div className="seats">
          <div className="bar"><div className={`fill ${full ? 'full' : pct >= 80 ? 'warn' : ''}`} style={{ width: `${pct}%` }} /></div>
          <span className="seats-text">{full ? 'No seats left' : `${left} of ${course.capacity} seats left`}</span>
        </div>
        {action}
      </div>
    </article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="ccard ccard-skel" aria-hidden="true">
      <div className="skel skel-media" />
      <div className="ccard-body">
        <div className="skel skel-line short" />
        <div className="skel skel-line" />
        <div className="skel skel-line" />
        <div className="skel skel-line mid" />
      </div>
    </div>
  );
}
