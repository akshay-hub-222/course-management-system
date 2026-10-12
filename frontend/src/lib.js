import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

/** "8 weeks" -> 8 (null when the duration has no number in it). */
export function parseWeeks(duration) {
  const m = /(\d+)/.exec(duration || '');
  return m ? Number(m[1]) : null;
}

export const seatsLeft = (c) => Math.max(0, c.capacity - c.enrolledCount);
export const isFull = (c) => c.enrolledCount >= c.capacity;

export function initials(name = '') {
  return name
    .replace(/^(dr|prof|mr|ms|mrs)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/** Where a signed-in user lands. */
export const homeFor = (user) => (user?.role === 'ADMIN' ? '/admin' : '/dashboard');

/**
 * Loads the course catalogue. Signed-in users use the normal API, visitors use the
 * read-only public catalogue so the landing page and explorer work before login.
 */
export function useCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = async () => {
    try {
      setCourses(await api(user ? '/courses' : '/public/courses'));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { courses, loading, error, reload };
}
