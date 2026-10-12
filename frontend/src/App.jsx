import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import { homeFor } from './lib.js';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Courses from './pages/Courses.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyCourses from './pages/MyCourses.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminCourses from './pages/AdminCourses.jsx';
import AdminEnrollments from './pages/AdminEnrollments.jsx';
import AdminStudents from './pages/AdminStudents.jsx';

/** Requires a signed-in user (optionally with a given role). */
function Protected({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return children;
}

/** Login / register are only for visitors; signed-in users are sent to where they belong. */
function GuestOnly({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (user) return <Navigate to={location.state?.from || homeFor(user)} replace />;
  return children;
}

function SiteLayout() {
  const { pathname, hash } = useLocation();
  // Start every page at the top, except for in-page anchors (handled by the landing page).
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <div className="site">
      <Navbar />
      <main className="site-main"><Outlet /></main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route element={<SiteLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/dashboard" element={<Protected role="STUDENT"><Dashboard /></Protected>} />
        <Route path="/my-courses" element={<Protected role="STUDENT"><MyCourses /></Protected>} />
      </Route>

      <Route path="/admin" element={<Protected role="ADMIN"><AdminLayout /></Protected>}>
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="enrollments" element={<AdminEnrollments />} />
        <Route path="students" element={<AdminStudents />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
