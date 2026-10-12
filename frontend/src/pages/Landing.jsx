import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Footer from '../components/Footer.jsx';
import CourseArt from '../components/CourseArt.jsx';
import CourseCard, { CourseCardSkeleton } from '../components/CourseCard.jsx';
import Icon from '../components/Icon.jsx';
import { homeFor, seatsLeft, useCatalog } from '../lib.js';

const BENEFITS = [
  { icon: 'zap', title: 'Enroll in one click', text: 'Pick a course and you are in. Drop it just as easily if your plans change.' },
  { icon: 'users', title: 'Live seat availability', text: 'Every course shows how many seats are left, so you always know before you commit.' },
  { icon: 'search', title: 'Find the right course', text: 'Search by title, code or instructor and filter by category, level or availability.' },
  { icon: 'calendar', title: 'A timeline you can follow', text: 'Your dashboard lays out each enrolled course against its duration, week by week.' },
];

const STEPS = [
  { n: '01', title: 'Create your account', text: 'Register with your email in under a minute.' },
  { n: '02', title: 'Choose your courses', text: 'Browse the catalogue and enroll in what fits your goals.' },
  { n: '03', title: 'Follow your schedule', text: 'Use your dashboard to see what is running and what is next.' },
];

export default function Landing() {
  const { user } = useAuth();
  const { courses, loading } = useCatalog();
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, loading]);

  const featured = useMemo(
    () => [...courses].sort((a, b) => b.enrolledCount - a.enrolledCount || a.id - b.id).slice(0, 3),
    [courses]
  );

  const categories = useMemo(() => {
    const map = new Map();
    courses.forEach((c) => c.category && map.set(c.category, (map.get(c.category) || 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [courses]);

  const stats = [
    { value: courses.length, label: 'Courses' },
    { value: new Set(courses.map((c) => c.instructor)).size, label: 'Instructors' },
    { value: courses.reduce((s, c) => s + c.enrolledCount, 0), label: 'Enrollments' },
    { value: courses.reduce((s, c) => s + seatsLeft(c), 0), label: 'Open seats' },
  ].filter((s) => s.value > 0);

  const lead = featured[0];
  const rest = featured.slice(1, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><Icon name="cap" size={14} /> Course management platform</span>
            <h1 className="hero-title">Learn Skills That Move Your Career Forward.</h1>
            <p className="hero-sub">
              Explore expert-led courses, enroll in seconds and keep your whole learning plan in one clean dashboard.
            </p>
            <div className="hero-cta">
              <Link to="/courses" className="btn btn-primary btn-lg">Explore courses <Icon name="arrow" size={18} /></Link>
              {user ? (
                <Link to={homeFor(user)} className="btn btn-ghost btn-lg">Go to dashboard</Link>
              ) : (
                <Link to="/register" className="btn btn-ghost btn-lg">Create free account</Link>
              )}
            </div>
            <ul className="hero-points">
              <li><Icon name="check" size={15} strokeWidth={2.6} /> Real seat limits</li>
              <li><Icon name="check" size={15} strokeWidth={2.6} /> One-click enrollment</li>
              <li><Icon name="check" size={15} strokeWidth={2.6} /> Drop any time</li>
            </ul>
          </div>

          <div className="hero-visual" aria-hidden={!lead}>
            <div className="window">
              <div className="window-bar">
                <i /><i /><i />
                <span className="window-url">learnify / courses</span>
              </div>
              <div className="window-body">
                {lead ? (
                  <>
                    <div className="preview-lead">
                      <CourseArt course={lead} />
                      <div className="preview-lead-info">
                        {lead.category && <span className="tag">{lead.category}</span>}
                        <strong>{lead.title}</strong>
                        <span>{lead.instructor} · {lead.duration || 'Self-paced'}</span>
                      </div>
                    </div>
                    <div className="preview-rows">
                      {rest.map((c) => (
                        <div key={c.id} className="preview-row">
                          <CourseArt course={c} className="art-thumb" />
                          <div>
                            <strong>{c.title}</strong>
                            <span>{c.instructor}</span>
                          </div>
                          <em>{seatsLeft(c)} seats</em>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="preview-empty">
                    <div className="skel skel-media" />
                    <div className="skel skel-line" />
                    <div className="skel skel-line mid" />
                  </div>
                )}
              </div>
            </div>
            {lead && (
              <>
                <div className="float float-a"><Icon name="users" size={16} /> <b>{lead.enrolledCount}</b> enrolled in {lead.code}</div>
                <div className="float float-b"><Icon name="check" size={16} strokeWidth={2.6} /> {courses.length} courses open</div>
              </>
            )}
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="container">
          <div className="statstrip">
            {stats.map((s) => (
              <div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>
            ))}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Featured</span>
            <h2 className="h2">Popular courses right now</h2>
            <p className="lead-text">The courses most students are choosing.</p>
          </div>
          <Link to="/courses" className="link-arrow">View all courses <Icon name="arrow" size={16} /></Link>
        </div>
        <div className="grid-cards">
          {loading
            ? [0, 1, 2].map((i) => <CourseCardSkeleton key={i} />)
            : featured.map((c) => <CourseCard key={c.id} course={c} user={user} readOnly onOpen={() => navigate('/courses')} />)}
        </div>
        {!loading && featured.length === 0 && <div className="empty">Courses will appear here once they are added.</div>}
      </section>

      {categories.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Categories</span>
              <h2 className="h2">Browse by topic</h2>
            </div>
          </div>
          <div className="cat-grid">
            {categories.map(([name, n]) => (
              <Link key={name} to={`/courses?category=${encodeURIComponent(name)}`} className="cat-tile">
                <span className="cat-icon"><Icon name="layers" size={20} /></span>
                <strong>{name}</strong>
                <span>{n} course{n === 1 ? '' : 's'}</span>
                <Icon name="arrow" size={16} className="cat-arrow" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="benefits" className="section section-tint">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <span className="eyebrow">Why Learnify</span>
              <h2 className="h2">Everything you need to learn with focus</h2>
            </div>
          </div>
          <div className="benefit-grid">
            {BENEFITS.map((b) => (
              <div key={b.title} className="benefit">
                <span className="benefit-icon"><Icon name={b.icon} size={20} /></span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="section container">
        <div className="section-head section-head-center">
          <div>
            <span className="eyebrow">How it works</span>
            <h2 className="h2">From sign-up to first lesson in three steps</h2>
          </div>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="cta-band">
          <div>
            <h2>Ready to start learning?</h2>
            <p>Join Learnify and choose your first course today.</p>
          </div>
          <div className="cta-actions">
            <Link to={user ? '/courses' : '/register'} className="btn btn-white btn-lg">{user ? 'Browse courses' : 'Create your account'}</Link>
            {!user && <Link to="/courses" className="btn btn-outline-light btn-lg">Explore courses</Link>}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
