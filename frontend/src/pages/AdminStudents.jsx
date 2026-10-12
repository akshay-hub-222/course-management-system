import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Icon from '../components/Icon.jsx';
import { initials } from '../lib.js';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([api('/admin/students'), api('/admin/enrollments')])
      .then(([s, e]) => { setStudents(s); setEnrollments(e); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const m = new Map();
    enrollments.forEach((e) => m.set(e.studentId, (m.get(e.studentId) || 0) + 1));
    return m;
  }, [enrollments]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return students.filter((s) => !term || s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term));
  }, [students, q]);

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="h1-sm">Students</h1>
          <p className="muted">{loading ? 'Loading…' : `${students.length} registered student${students.length === 1 ? '' : 's'}`}</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}

      <div className="tablebar">
        <label className="searchbox searchbox-sm">
          <Icon name="search" size={16} />
          <input type="search" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
        </label>
      </div>

      <div className="table-card">
        <table className="dtable">
          <thead><tr><th>Student</th><th>Email</th><th>Enrolled courses</th></tr></thead>
          <tbody>
            {!loading && rows.length === 0 && <tr><td colSpan="3" className="empty-cell">{students.length ? 'No students match your search.' : 'No students have registered yet.'}</td></tr>}
            {rows.map((s) => (
              <tr key={s.id}>
                <td><div className="cell-course"><span className="avatar avatar-sm">{initials(s.name)}</span><strong>{s.name}</strong></div></td>
                <td>{s.email}</td>
                <td><span className="pill pill-neutral">{counts.get(s.id) || 0}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
