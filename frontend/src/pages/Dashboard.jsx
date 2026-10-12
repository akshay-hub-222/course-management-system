import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import CourseArt from '../components/CourseArt.jsx';
import CourseCard from '../components/CourseCard.jsx';
import CourseModal from '../components/CourseModal.jsx';
import Footer from '../components/Footer.jsx';
import Icon from '../components/Icon.jsx';
import { useToast } from '../components/Toast.jsx';
import { fmtDate, greeting, initials, isFull, parseWeeks } from '../lib.js';

const WEEK = 7 * 24 * 3600 * 1000;

/** Where an enrollment sits in its scheduled duration (derived from enrollment date + course duration). */
function timeline(enrollment, course) {
  const total = parseWeeks(course?.duration);
  if (!total) return null;
  const elapsed = Math.max(0, (Date.now() - new Date(enrollment.enrolledAt).getTime()) / WEEK);
  const week = Math.min(total, Math.floor(elapsed) + 1);
  return { total, week, pct: Math.min(100, Math.round((elapsed / total) * 100)), over: elapsed >= total };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [mine, setMine] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, show] = useToast();

  const load = async () => {
    try {
      const [m, c] = await Promise.all([api('/enrollments/my'), api('/courses')]);
      setMine(m);
      setCourses(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const byId = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const enrolledIds = useMemo(() => new Set(mine.map((e) => e.courseId)), [mine]);

  const active = useMemo(
    () => mine
      .map((e) => ({ e, c: byId.get(e.courseId) }))
      .filter((x) => x.c)
      .sort((a, b) => new Date(b.e.enrolledAt) - new Date(a.e.enrolledAt)),
    [mine, byId]
  );

  const credits = active.reduce((s, x) => s + x.c.credits, 0);
  const weeks = active.reduce((s, x) => s + (parseWeeks(x.c.duration) || 0), 0);
  const suggestions = courses.filter((c) => !enrolledIds.has(c.id) && !isFull(c)).sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, 3);

  const drop = async (course) => {
    setBusy(true);
    try {
      await api(`/enrollments/${course.id}`, { method: 'DELETE' });
      show('ok', `You dropped ${course.title}.`);
      setOpen(null);
      await load();
    } catch (err) {
      show('error', err.message);
    } finally {
      setBusy(false);
    }
  };
  const enroll = async (course) => {
    setBusy(true);
    try {
      await api(`/enrollments/${course.id}`, { method: 'POST' });
      show('ok', `You are enrolled in ${course.title}.`);
      setOpen(null);
      await load();
    } catch (err) {
      show('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  const first = user.name.split(' ')[0];
  const live = open ? byId.get(open) : null;

  const stats = [
    { icon: 'book', label: 'Enrolled courses', value: active.length },
    { icon: 'award', label: 'Credits enrolled', value: credits },
    { icon: 'calendar', label: 'Scheduled weeks', value: weeks },
    { icon: 'layers', label: 'Courses to explore', value: courses.filter((c) => !enrolledIds.has(c.id) && !isFull(c)).length },
  ];

  return (
    <>
      <div className="container page-pad">
        <section className="welcome">
          <div>
            <span className="eyebrow eyebrow-light">Student dashboard</span>
            <h1>{greeting()}, {first}.</h1>
            <p>
              {loading
                ? 'Loading your learning plan…'
                : active.length === 0
                  ? 'You have not enrolled in a course yet. Pick one to get your learning plan started.'
                  : `You are enrolled in ${active.length} course${active.length === 1 ? '' : 's'}. Here is what is on your plan.`}
            </p>
            <div className="welcome-actions">
              <Link to="/courses" className="btn btn-white">Browse courses <Icon name="arrow" size={16} /></Link>
              {active.length > 0 && <Link to="/my-courses" className="btn btn-outline-light">My courses</Link>}
            </div>
          </div>
          <span className="avatar avatar-xl">{initials(user.name)}</span>
        </section>

        {error && <div className="alert">{error}</div>}

        <section className="kpis" aria-label="Your learning at a glance">
          {stats.map((s) => (
            <div className="kpi" key={s.label}>
              <span className="kpi-icon"><Icon name={s.icon} size={18} /></span>
              <strong>{loading ? '–' : s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        <section className="block">
          <div className="block-head">
            <h2>Continue learning</h2>
            {active.length > 0 && <Link to="/my-courses" className="link-arrow">All my courses <Icon name="arrow" size={16} /></Link>}
          </div>

          {!loading && active.length === 0 ? (
            <div className="empty">
              <Icon name="book" size={28} />
              <strong>Nothing here yet</strong>
              <span>Enroll in a course and it will show up here with its schedule.</span>
              <Link to="/courses" className="btn btn-primary">Find a course</Link>
            </div>
          ) : (
            <div className="learn-list">
              {active.map(({ e, c }) => {
                const t = timeline(e, c);
                return (
                  <article key={e.id} className="learn">
                    <CourseArt course={c} className="art-learn" />
                    <div className="learn-main">
                      <div className="ccard-meta">
                        {c.category && <span className="tag">{c.category}</span>}
                        {c.level && <span className={`level level-${c.level.toLowerCase()}`}>{c.level}</span>}
                      </div>
                      <h3>{c.title}</h3>
                      <p className="learn-sub"><span className="avatar avatar-sm">{initials(c.instructor)}</span>{c.instructor} · Enrolled {fmtDate(e.enrolledAt)}</p>
                      {t ? (
                        <div className="timeline">
                          <div className="bar"><div className="fill" style={{ width: `${t.pct}%` }} /></div>
                          <span>{t.over ? `Scheduled ${t.total} weeks have passed` : `Week ${t.week} of ${t.total}`}</span>
                        </div>
                      ) : (
                        <div className="timeline"><span>Self-paced course</span></div>
                      )}
                    </div>
                    <div className="learn-actions">
                      <button className="btn btn-primary" onClick={() => setOpen(c.id)}>View details</button>
                      <button className="btn btn-ghost" onClick={() => drop(c)} disabled={busy}>Drop</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {suggestions.length > 0 && (
          <section className="block">
            <div className="block-head">
              <h2>Explore next</h2>
              <Link to="/courses" className="link-arrow">Browse all <Icon name="arrow" size={16} /></Link>
            </div>
            <div className="grid-cards">
              {suggestions.map((c) => (
                <CourseCard key={c.id} course={c} user={user} enrolled={false} busy={busy} onEnroll={enroll} onDrop={drop} onOpen={(x) => setOpen(x.id)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {live && (
        <CourseModal course={live} user={user} enrolled={enrolledIds.has(live.id)} busy={busy} onClose={() => setOpen(null)} onEnroll={enroll} onDrop={drop} />
      )}
      {toast}
      <Footer />
    </>
  );
}
