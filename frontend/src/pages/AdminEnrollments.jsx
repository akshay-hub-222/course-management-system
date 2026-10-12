import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Icon from '../components/Icon.jsx';
import { useToast } from '../components/Toast.jsx';
import { fmtDate, initials } from '../lib.js';

export default function AdminEnrollments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [course, setCourse] = useState('all');
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, show] = useToast();

  const load = async () => {
    try {
      setItems(await api('/admin/enrollments'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const codes = useMemo(() => [...new Set(items.map((i) => i.courseCode))].sort(), [items]);
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items
      .filter((e) => (course === 'all' || e.courseCode === course) && (!term || [e.studentName, e.studentEmail, e.courseTitle, e.courseCode].some((v) => v.toLowerCase().includes(term))))
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
  }, [items, q, course]);

  const remove = async () => {
    setBusy(true);
    try {
      await api(`/admin/enrollments/${removing.id}`, { method: 'DELETE' });
      show('ok', 'Enrollment removed.');
      setRemoving(null);
      load();
    } catch (err) {
      show('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="h1-sm">Enrollments</h1>
          <p className="muted">{loading ? 'Loading…' : `${items.length} enrollment${items.length === 1 ? '' : 's'} across all courses`}</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}

      <div className="tablebar">
        <label className="searchbox searchbox-sm">
          <Icon name="search" size={16} />
          <input type="search" placeholder="Search student, email or course" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search enrollments" />
        </label>
        <div className="selects">
          <select value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Course">
            <option value="all">All courses</option>
            {codes.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="table-card">
        <table className="dtable">
          <thead><tr><th>Student</th><th>Course</th><th>Enrolled on</th><th aria-label="Actions" /></tr></thead>
          <tbody>
            {!loading && rows.length === 0 && <tr><td colSpan="4" className="empty-cell">{items.length ? 'No enrollments match your search.' : 'No enrollments yet.'}</td></tr>}
            {rows.map((e) => (
              <tr key={e.id}>
                <td>
                  <div className="cell-course">
                    <span className="avatar avatar-sm">{initials(e.studentName)}</span>
                    <div><strong>{e.studentName}</strong><span>{e.studentEmail}</span></div>
                  </div>
                </td>
                <td><code>{e.courseCode}</code> {e.courseTitle}</td>
                <td>{fmtDate(e.enrolledAt)}</td>
                <td className="right actions">
                  <button className="icon-btn icon-btn-danger" onClick={() => setRemoving(e)} aria-label="Remove enrollment" title="Remove"><Icon name="trash" size={17} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {removing && (
        <ConfirmDialog
          danger
          busy={busy}
          title="Remove this enrollment?"
          message={`${removing.studentName} will be removed from ${removing.courseCode} – ${removing.courseTitle}.`}
          confirmLabel="Remove"
          onConfirm={remove}
          onCancel={() => setRemoving(null)}
        />
      )}
      {toast}
    </>
  );
}
