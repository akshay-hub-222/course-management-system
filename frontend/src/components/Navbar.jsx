import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Icon, { Logo } from './Icon.jsx';
import { homeFor, initials } from '../lib.js';

/** Public / student navigation. Admins get the sidebar layout instead. */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className={`topnav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container topnav-inner">
        <Link to="/" className="topnav-logo" aria-label="Learnify home"><Logo /></Link>

        <nav className={`topnav-links ${open ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          {!user && <Link to="/#benefits">Why Learnify</Link>}
          {user && !isAdmin && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user && !isAdmin && <NavLink to="/my-courses">My courses</NavLink>}

          <div className="topnav-auth-mobile">
            {user ? (
              <>
                <Link className="btn btn-soft btn-block" to={homeFor(user)}>{isAdmin ? 'Admin console' : 'Dashboard'}</Link>
                <button className="btn btn-ghost btn-block" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost btn-block" to="/login">Log in</Link>
                <Link className="btn btn-primary btn-block" to="/register">Get started</Link>
              </>
            )}
          </div>
        </nav>

        <div className="topnav-auth">
          {user ? (
            <>
              {isAdmin && <Link className="btn btn-soft btn-sm" to="/admin">Admin console</Link>}
              <span className="avatar" title={user.name}>{initials(user.name)}</span>
              <button className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out"><Icon name="logout" /></button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm" to="/login">Log in</Link>
              <Link className="btn btn-primary btn-sm" to="/register">Get started</Link>
            </>
          )}
        </div>

        <button className="icon-btn topnav-burger" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          <Icon name={open ? 'x' : 'menu'} size={22} />
        </button>
      </div>
    </header>
  );
}
