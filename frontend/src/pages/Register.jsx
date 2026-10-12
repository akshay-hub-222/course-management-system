import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Student accounts can browse and enroll in courses.">
      <form onSubmit={submit} className="form">
        {error && <div className="alert">{error}</div>}
        <label>Full name
          <input value={form.name} onChange={set('name')} required autoFocus />
        </label>
        <label>Email
          <input type="email" value={form.email} onChange={set('email')} required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set('password')} minLength={6} required />
        </label>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="auth-alt">Already registered? <Link to="/login">Log in</Link></p>
    </AuthShell>
  );
}
