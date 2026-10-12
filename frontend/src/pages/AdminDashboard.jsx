import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Columns, Donut, HBars } from '../components/Charts.jsx';
import Icon from '../components/Icon.jsx';
import { fmtDate, isFull } from '../lib.js';

const DAYS = 14;

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/admin/stats'), api('/courses'), api('/admin/enrollments')])
      .then(([stats, courses, enrollments]) => setData({ stats, courses, enrollments }))
      .catch((e) => setError(e.message));
  }, []);

  const view = useMemo(() => {
    if (!data) return null;
    const { stats, courses, enrollments } = data;
    const seats = courses.reduce((s, c) => s + c.capacity, 0);
    const taken = courses.reduce((s, c) => s + c.enrolledCount, 0);
    const top = [...courses].sort((a, b) => b.enrolledCount - a.enrolledCount)[0];

    const perCourse = [...courses]
      .sort((a, b) => b.enrolledCount - a.enrolledCount)
      .slice(0, 8)
      .map((c) => ({ label: c.code + ' · ' + c.title, value: c.enrolledCount, total: c.capacity }));

    const days = Array.from({ length: DAYS }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (DAYS - 1 - i));
      return { key: d.toDateString(), label: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), value: 0 };
    });
    enrollments.forEach((e) => {
      const hit = days.find((d) => d.key === new Date(e.enrolledAt).toDateString());
      if (hit) hit.value += 1;
    });

    const cats = new Map();
    courses.forEach((c) => cats.set(c.category || 'Uncategorised', (cats.get(c.category || 'Uncategorised') || 0) + 1));
    const slices = [...cats.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

    const recent = [...enrollments].sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)).slice(0, 6);

    return {
      stats, seats, taken, top, perCourse, days, slices, recent,
      fillPct: seats ? Math.round((taken / seats) * 100) : 0,
      fullCount: courses.filter(isFull).length,
      weekCount: days.slice(-7).reduce((s, d) => s + d.value, 0),
      anyDays: days.some((d) => d.value > 0),
    };
  }, [data]);

  const kpis = view && [
    { icon: 'book', label: 'Total courses', value: view.stats.courses },
    { icon: 'users', label: 'Registered students', value: view.stats.students },
    { icon: 'layers', label: 'Enrollments', value: view.stats.enrollments, note: `${view.weekCount} in the last 7 days` },
    { icon: 'chart', label: 'Seat utilisation', value: `${view.fillPct}%`, note: `${view.taken} of ${view.seats} seats filled` },
  ];

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="h1-sm">Overview</h1>
          <p className="muted">How your courses and enrollments are doing right now.</p>
        </div>
        <Link to="/admin/courses" className="btn btn-primary"><Icon name="plus" size={16} /> Add course</Link>
      </div>

      {error && <div className="alert">{error}</div>}
      {!view && !error && <div className="kpis">{[0, 1, 2, 3].map((i) => <div key={i} className="kpi skel skel-kpi" />)}</div>}

      {view && (
        <>
          <section className="kpis">
            {kpis.map((k) => (
              <div className="kpi" key={k.label}>
                <span className="kpi-icon"><Icon name={k.icon} size={18} /></span>
                <strong>{k.value}</strong>
                <span>{k.label}</span>
                {k.note && <small>{k.note}</small>}
              </div>
            ))}
          </section>

          <div className="admin-grid">
            <section className="panel panel-wide">
              <div className="panel-head">
                <div><h2>Enrollments per course</h2><p>Filled seats against capacity</p></div>
                {view.fullCount > 0 && <span className="pill">{view.fullCount} full</span>}
              </div>
              {view.perCourse.length ? <HBars rows={view.perCourse} /> : <p className="panel-empty">No courses yet.</p>}
            </section>

            <section className="panel">
              <div className="panel-head"><div><h2>Courses by category</h2><p>Catalogue mix</p></div></div>
              {view.slices.length ? <Donut slices={view.slices} centerLabel="courses" /> : <p className="panel-empty">No courses yet.</p>}
            </section>

            <section className="panel panel-wide">
              <div className="panel-head"><div><h2>Enrollment activity</h2><p>New enrollments in the last {DAYS} days</p></div></div>
              {view.anyDays ? (
                <>
                  <Columns data={view.days} />
                  <div className="axis"><span>{view.days[0].label}</span><span>{view.days[DAYS - 1].label}</span></div>
                </>
              ) : (
                <p className="panel-empty">No enrollments in the last {DAYS} days.</p>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <div><h2>Recent enrollments</h2><p>Latest sign-ups</p></div>
                <Link to="/admin/enrollments" className="link-arrow">All</Link>
              </div>
              {view.recent.length ? (
                <ul className="feed">
                  {view.recent.map((e) => (
                    <li key={e.id}>
                      <span className="avatar avatar-sm">{e.studentName.slice(0, 1).toUpperCase()}</span>
                      <div><strong>{e.studentName}</strong><span>{e.courseCode} · {fmtDate(e.enrolledAt)}</span></div>
                    </li>
                  ))}
                </ul>
              ) : <p className="panel-empty">No enrollments yet.</p>}
            </section>
          </div>

          {view.top && view.top.enrolledCount > 0 && (
            <p className="insight"><Icon name="award" size={16} /> Most popular course: <strong>{view.top.title}</strong> with {view.top.enrolledCount} enrolled.</p>
          )}
        </>
      )}
    </>
  );
}
