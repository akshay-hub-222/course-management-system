import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import CourseCard, { CourseCardSkeleton } from '../components/CourseCard.jsx';
import CourseModal from '../components/CourseModal.jsx';
import Footer from '../components/Footer.jsx';
import Icon from '../components/Icon.jsx';
import { useToast } from '../components/Toast.jsx';

export default function MyCourses() {
  const { user } = useAuth();
  const [mine, setMine] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [open, setOpen] = useState(null);
  const [toast, show] = useToast();

  const load = async () => {
    try {
      const [m, c] = await Promise.all([api('/enrollments/my'), api('/courses')]);
      setMine(m);
      setCourses(c);
    } catch (err) {
      show('error', err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const enrolledIds = useMemo(() => new Set(mine.map((e) => e.courseId)), [mine]);
  const list = useMemo(
    () => mine
      .map((e) => courses.find((c) => c.id === e.courseId))
      .filter(Boolean),
    [mine, courses]
  );

  const drop = async (course) => {
    setBusyId(course.id);
    try {
      await api(`/enrollments/${course.id}`, { method: 'DELETE' });
      show('ok', `You dropped ${course.title}.`);
      setOpen(null);
      await load();
    } catch (err) {
      show('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const live = open ? courses.find((c) => c.id === open) : null;

  return (
    <>
      <section className="pagehead">
        <div className="container pagehead-row">
          <div>
            <span className="eyebrow">My learning</span>
            <h1 className="h1">My courses</h1>
            <p className="lead-text">{loading ? 'Loading…' : `${list.length} course${list.length === 1 ? '' : 's'} you are enrolled in.`}</p>
          </div>
          <Link to="/courses" className="btn btn-primary"><Icon name="plus" size={16} /> Find more courses</Link>
        </div>
      </section>

      <div className="container explorer">
        {loading ? (
          <div className="grid-cards">{[0, 1, 2].map((i) => <CourseCardSkeleton key={i} />)}</div>
        ) : list.length === 0 ? (
          <div className="empty">
            <Icon name="book" size={28} />
            <strong>You have not enrolled in any course yet</strong>
            <span>Browse the catalogue and enroll in your first course.</span>
            <Link to="/courses" className="btn btn-primary">Browse courses</Link>
          </div>
        ) : (
          <div className="grid-cards">
            {list.map((c) => (
              <CourseCard key={c.id} course={c} user={user} enrolled busy={busyId === c.id} onDrop={drop} onOpen={(x) => setOpen(x.id)} />
            ))}
          </div>
        )}
      </div>

      {live && <CourseModal course={live} user={user} enrolled={enrolledIds.has(live.id)} busy={busyId === live.id} onClose={() => setOpen(null)} onDrop={drop} />}
      {toast}
      <Footer />
    </>
  );
}
