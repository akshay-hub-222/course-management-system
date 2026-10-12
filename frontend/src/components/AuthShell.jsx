import { Link } from 'react-router-dom';
import Icon, { Logo } from './Icon.jsx';

const POINTS = [
  'Browse the full course catalogue',
  'Enroll in one click, drop any time',
  'See your learning plan in one dashboard',
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Link to="/" aria-label="Back to home"><Logo light /></Link>
        <div className="auth-pitch">
          <h2>Learn skills that move your career forward.</h2>
          <ul>
            {POINTS.map((p) => (
              <li key={p}><span><Icon name="check" size={14} strokeWidth={2.8} /></span>{p}</li>
            ))}
          </ul>
        </div>
        <small>© {new Date().getFullYear()} Learnify</small>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <Link to="/" className="auth-back"><Icon name="arrow" size={14} className="flip" /> Back to home</Link>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
