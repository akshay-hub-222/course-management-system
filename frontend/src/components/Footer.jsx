import { Link } from 'react-router-dom';
import { Logo } from './Icon.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p>A course management platform for browsing, enrolling and keeping track of your learning in one place.</p>
        </div>
        <div>
          <h4>Platform</h4>
          <Link to="/courses">Browse courses</Link>
          <Link to="/#benefits">Why Learnify</Link>
          <Link to="/#how">How it works</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
          <Link to="/dashboard">Student dashboard</Link>
        </div>
        <div>
          <h4>Built with</h4>
          <span>React &amp; Vite</span>
          <span>Spring Boot</span>
          <span>MySQL</span>
        </div>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} Learnify. Course Management System.</span>
        <span>Made as a college project.</span>
      </div>
    </footer>
  );
}
