import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import CourseArt from '../components/CourseArt.jsx';
import Icon from '../components/Icon.jsx';
import { useToast } from '../components/Toast.jsx';
import { LEVELS, isFull } from '../lib.js';

const blank = { code: '', title: '', description: '', instructor: '', duration: '', category: '', level: '', imageUrl: '', credits: 3, capacity: 30 };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');
  const [toast, show] = useToast();

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');

  const load = async () => {
    try {
      setCourses(await api('/courses'));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const categories = useMemo(() => [...new Set(courses.map((c) => c.category).filter(Boolean))].sort(), [courses]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return courses.filter((c) => {
      if (term && ![c.title, c.code, c.instructor, c.category].some((v) => (v || '').toLowerCase().includes(term))) return false;
      if (cat !== 'all' && c.category !== cat) return false;
      if (level !== 'all' && c.level !== level) return false;
      if (status === 'full' && !isFull(c)) return false;
      if (status === 'open' && isFull(c)) return false;
      if (status === 'empty' && c.enrolledCount > 0) return false;
      return true;
    });
  }, [courses, q, cat, level, status]);

  const filtered = q || cat !== 'all' || level !== 'all' || status !== 'all';

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = {
      ...editing,
      category: editing.category?.trim() || null,
      level: editing.level || null,
      imageUrl: editing.imageUrl?.trim() || null,
      credits: Number(editing.credits),
      capacity: Number(editing.capacity),
    };
    try {
      if (editing.id) await api(`/courses/${editing.id}`, { method: 'PUT', body: payload });
      else await api('/courses', { method: 'POST', body: payload });
      show('ok', editing.id ? 'Course updated.' : 'Course added.');
      setEditing(null);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api(`/courses/${deleting.id}`, { method: 'DELETE' });
      show('ok', `${deleting.code} deleted.`);
      setDeleting(null);
      load();
    } catch (err) {
      show('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="h1-sm">Courses</h1>
          <p className="muted">{loading ? 'Loading…' : `${courses.length} course${courses.length === 1 ? '' : 's'} in the catalogue`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormError(''); setEditing({ ...blank }); }}><Icon name="plus" size={16} /> Add course</button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="tablebar">
        <label className="searchbox searchbox-sm">
          <Icon name="search" size={16} />
          <input type="search" placeholder="Search title, code, instructor" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search courses" />
        </label>
        <div className="selects">
          {categories.length > 0 && (
            <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          )}
          <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
            <option value="all">All levels</option>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Seat status">
            <option value="all">Any status</option>
            <option value="open">Seats available</option>
            <option value="full">Full</option>
            <option value="empty">No enrollments</option>
          </select>
          {filtered && <button className="link-btn" onClick={() => { setQ(''); setCat('all'); setLevel('all'); setStatus('all'); }}>Clear</button>}
        </div>
      </div>

      <div className="table-card">
        <table className="dtable">
          <thead>
            <tr><th>Course</th><th>Category</th><th>Instructor</th><th>Duration</th><th>Seats</th><th aria-label="Actions" /></tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr><td colSpan="6" className="empty-cell">{filtered ? 'No courses match your filters.' : 'No courses yet. Add the first one.'}</td></tr>
            )}
            {rows.map((c) => {
              const pct = Math.min(100, Math.round((c.enrolledCount / c.capacity) * 100));
              return (
                <tr key={c.id}>
                  <td>
                    <div className="cell-course">
                      <CourseArt course={c} className="art-thumb" />
                      <div>
                        <strong>{c.title}</strong>
                        <span><code>{c.code}</code>{c.level ? ` · ${c.level}` : ''} · {c.credits} cr</span>
                      </div>
                    </div>
                  </td>
                  <td>{c.category ? <span className="tag">{c.category}</span> : <span className="faint">—</span>}</td>
                  <td>{c.instructor}</td>
                  <td>{c.duration || <span className="faint">—</span>}</td>
                  <td>
                    <div className="seatcell">
                      <div className="bar"><div className={`fill ${isFull(c) ? 'full' : ''}`} style={{ width: `${pct}%` }} /></div>
                      <span>{c.enrolledCount} / {c.capacity}</span>
                    </div>
                  </td>
                  <td className="right actions">
                    <button className="icon-btn" onClick={() => { setFormError(''); setEditing({ ...blank, ...c, category: c.category || '', level: c.level || '', imageUrl: c.imageUrl || '' }); }} aria-label={`Edit ${c.title}`} title="Edit"><Icon name="edit" size={17} /></button>
                    <button className="icon-btn icon-btn-danger" onClick={() => setDeleting(c)} aria-label={`Delete ${c.title}`} title="Delete"><Icon name="trash" size={17} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="overlay" onClick={() => setEditing(null)}>
          <form className="dialog dialog-form" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <div className="dialog-body">
              <h2 className="dialog-title">{editing.id ? 'Edit course' : 'Add course'}</h2>
              {formError && <div className="alert">{formError}</div>}
              <div className="grid2">
                <label>Course code<input value={editing.code} onChange={set('code')} required maxLength={20} placeholder="e.g. CS301" /></label>
                <label>Instructor<input value={editing.instructor} onChange={set('instructor')} required /></label>
              </div>
              <label>Title<input value={editing.title} onChange={set('title')} required maxLength={150} /></label>
              <label>Description<textarea rows="3" value={editing.description || ''} onChange={set('description')} maxLength={2000} /></label>
              <div className="grid2">
                <label>Category
                  <input list="cats" value={editing.category} onChange={set('category')} maxLength={60} placeholder="e.g. Web Development" />
                  <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </label>
                <label>Level
                  <select value={editing.level} onChange={set('level')}>
                    <option value="">Not set</option>
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid3">
                <label>Duration<input value={editing.duration || ''} onChange={set('duration')} placeholder="e.g. 10 weeks" maxLength={50} /></label>
                <label>Credits<input type="number" min="1" max="20" value={editing.credits} onChange={set('credits')} required /></label>
                <label>Capacity<input type="number" min="1" value={editing.capacity} onChange={set('capacity')} required /></label>
              </div>
              <label>Thumbnail image URL <span className="optional">optional</span>
                <input type="url" value={editing.imageUrl} onChange={set('imageUrl')} maxLength={500} placeholder="https://…  (an illustration is used if empty)" />
              </label>
              <div className="dialog-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save course'}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          danger
          busy={saving}
          title={`Delete ${deleting.code}?`}
          message={`"${deleting.title}" will be removed${deleting.enrolledCount ? `, along with its ${deleting.enrolledCount} enrollment${deleting.enrolledCount === 1 ? '' : 's'}` : ''}. This cannot be undone.`}
          confirmLabel="Delete course"
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
        />
      )}
      {toast}
    </>
  );
}
