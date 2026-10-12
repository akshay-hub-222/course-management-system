const BASE = '/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('cms_token');
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    // Session expired or server restarted: send the user back to the login page.
    if (res.status === 401 && token && !path.startsWith('/auth')) {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
      window.location.href = '/login';
    }
    throw new Error(data?.message || 'Something went wrong. Please try again.');
  }
  return data;
}
