import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await login(email, password);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel — hidden on mobile */}
      <div className="hidden md:flex flex-col justify-between w-2/5 bg-neutral-900 p-12 text-white">
        <span className="text-sm font-semibold tracking-tight">Trace</span>
        <div>
          <p className="text-3xl font-semibold tracking-tight leading-snug">
            Everything worth reading,<br />in one place.
          </p>
          <p className="mt-4 text-sm text-neutral-400">Save links. Read later. Stay organised.</p>
        </div>
        <p className="text-xs text-neutral-600">© {new Date().getFullYear()} Trace</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 px-6 py-12">
        {/* Mobile logo */}
        <p className="md:hidden text-sm font-semibold tracking-tight text-neutral-900 mb-8">Trace</p>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">Sign in</h1>
          <p className="text-sm text-neutral-500 mb-8">Welcome back.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-neutral-500">
            No account?{' '}
            <Link to="/register" className="text-neutral-900 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
