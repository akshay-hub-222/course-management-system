import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Icon, { Logo } from '../components/Icon.jsx';
import { initials } from '../lib.js';

const ITEMS = [
  { to: '/admin', end: true, icon: 'chart', label: 'Overview' },
  { to: '/admin/courses', icon: 'book', label: 'Courses' },
  { to: '/admin/enrollments', icon: 'layers', label: 'Enrollments' },
  { to: '/admin/students', icon: 'users', label: 'Students' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <Link to="/admin" className="sidebar-logo"><Logo light /></Link>
        <span className="sidebar-label">Admin console</span>
        <nav className="sidebar-nav">
          {ITEMS.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end}><Icon name={i.icon} size={18} />{i.label}</NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <Link to="/" className="sidebar-site">View public site <Icon name="arrow" size={14} /></Link>
          <div className="sidebar-user">
            <span className="avatar avatar-dark">{initials(user.name)}</span>
            <div><strong>{user.name}</strong><span>{user.email}</span></div>
            <button className="icon-btn icon-btn-dark" onClick={handleLogout} aria-label="Log out" title="Log out"><Icon name="logout" /></button>
          </div>
        </div>
      </aside>
      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} />}

      <div className="admin-main">
        <header className="admin-top">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" size={22} /></button>
          <Logo />
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}
