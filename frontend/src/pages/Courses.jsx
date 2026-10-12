import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import CourseCard, { CourseCardSkeleton } from '../components/CourseCard.jsx';
import CourseModal from '../components/CourseModal.jsx';
import Footer from '../components/Footer.jsx';
import Icon from '../components/Icon.jsx';
import { useToast } from '../components/Toast.jsx';
import { LEVELS, isFull, parseWeeks, useCatalog } from '../lib.js';

export default function Courses() {
  const { user } = useAuth();
  const { courses, loading, error, reload } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [busyId, setBusyId] = useState(null);
  const [open, setOpen] = useState(null);
  const [toast, show] = useToast();

  const [q, setQ] = useState('');
  const [level, setLevel] = useState('all');
  const [avail, setAvail] = useState('all');
  const [sort, setSort] = useState('popular');
  const category = params.get('category') || 'all';
  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c === 'all') next.delete('category'); else next.set('category', c);
    setParams(next, { replace: true });
  };

  const isStudent = user?.role === 'STUDENT';

  const loadMine = async () => {
    if (!isStudent) return setEnrolledIds(new Set());
    try {
      const mine = await api('/enrollments/my');
      setEnrolledIds(new Set(mine.map((e) => e.courseId)));
    } catch (err) {
      show('error', err.message);
    }
  };
  useEffect(() => { loadMine(); /* eslint-disable-next-line */ }, [user?.id]);

  const enroll = async (course) => {
    setBusyId(course.id);
    try {
      await api(`/enrollments/${course.id}`, { method: 'POST' });
      show('ok', `You are enrolled in ${course.title}.`);
      await Promise.all([reload(), loadMine()]);
    } catch (err) {
      show('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const drop = async (course) => {
    setBusyId(course.id);
    try {
      await api(`/enrollments/${course.id}`, { method: 'DELETE' });
      show('ok', `You dropped ${course.title}.`);
      await Promise.all([reload(), loadMine()]);
    } catch (err) {
      show('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const categories = useMemo(() => [...new Set(courses.map((c) => c.category).filter(Boolean))].sort(), [courses]);
  const levels = useMemo(() => LEVELS.filter((l) => courses.some((c) => c.level === l)), [courses]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = courses.filter((c) => {
      if (term && ![c.title, c.code, c.instructor, c.category, c.description].some((v) => (v || '').toLowerCase().includes(term))) return false;
      if (category !== 'all' && c.category !== category) return false;
      if (level !== 'all' && c.level !== level) return false;
      if (avail === 'open' && isFull(c)) return false;
      if (avail === 'enrolled' && !enrolledIds.has(c.id)) return false;
      return true;
    });
    const by = {
      popular: (a, b) => b.enrolledCount - a.enrolledCount || a.title.localeCompare(b.title),
      title: (a, b) => a.title.localeCompare(b.title),
      shortest: (a, b) => (parseWeeks(a.duration) ?? 999) - (parseWeeks(b.duration) ?? 999),
      seats: (a, b) => (b.capacity - b.enrolledCount) - (a.capacity - a.enrolledCount),
    }[sort];
    return list.sort(by);
  }, [courses, q, category, level, avail, sort, enrolledIds]);

  const filtered = q || category !== 'all' || level !== 'all' || avail !== 'all';
  const clear = () => { setQ(''); setLevel('all'); setAvail('all'); setCategory('all'); };

  const live = open ? courses.find((c) => c.id === open) : null;

  return (
    <>
      <section className="pagehead">
        <div className="container">
          <span className="eyebrow">Course catalogue</span>
          <h1 className="h1">Explore courses</h1>
          <p className="lead-text">Find a course that matches where you want to go next.</p>
          <label className="searchbox">
            <Icon name="search" size={18} />
            <input
              type="search"
              placeholder="Search by title, code, topic or instructor"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search courses"
            />
          </label>
        </div>
      </section>

      <div className="container explorer">
        <div className="toolbar">
          <div className="chips" role="tablist" aria-label="Category">
            <button className={`chip-btn ${category === 'all' ? 'on' : ''}`} onClick={() => setCategory('all')}>All</button>
            {categories.map((c) => (
              <button key={c} className={`chip-btn ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <div className="selects">
            {levels.length > 0 && (
              <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
                <option value="all">All levels</option>
                {levels.map((l) => <option key={l}>{l}</option>)}
              </select>
            )}
            <select value={avail} onChange={(e) => setAvail(e.target.value)} aria-label="Availability">
              <option value="all">Any availability</option>
              <option value="open">Seats available</option>
              {isStudent && <option value="enrolled">My enrollments</option>}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="popular">Most popular</option>
              <option value="title">Title A–Z</option>
              <option value="shortest">Shortest first</option>
              <option value="seats">Most seats left</option>
            </select>
          </div>
        </div>

        <div className="resultbar">
          <span>{loading ? 'Loading…' : `${visible.length} course${visible.length === 1 ? '' : 's'}`}</span>
          {filtered && <button className="link-btn" onClick={clear}>Clear filters</button>}
        </div>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <div className="grid-cards">{[0, 1, 2, 3, 4, 5].map((i) => <CourseCardSkeleton key={i} />)}</div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <Icon name="inbox" size={28} />
            <strong>No courses match</strong>
            <span>Try a different search or clear your filters.</span>
            {filtered && <button className="btn btn-soft" onClick={clear}>Clear filters</button>}
          </div>
        ) : (
          <div className="grid-cards">
            {visible.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                user={user}
                enrolled={enrolledIds.has(c.id)}
                busy={busyId === c.id}
                onEnroll={enroll}
                onDrop={drop}
                onOpen={(x) => setOpen(x.id)}
              />
            ))}
          </div>
        )}
      </div>

      {live && (
        <CourseModal
          course={live}
          user={user}
          enrolled={enrolledIds.has(live.id)}
          busy={busyId === live.id}
          onClose={() => setOpen(null)}
          onEnroll={enroll}
          onDrop={drop}
        />
      )}
      {toast}
      <Footer />
    </>
  );
}
