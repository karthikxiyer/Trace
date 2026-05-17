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
      <div className="hidden md:flex flex-col justify-between w-2/5 bg-[#003135] px-10 py-12 text-white overflow-hidden">
        <div className="flex-1 flex items-center">
          <span className="text-[10vw] font-black tracking-tighter leading-none text-[#AFDDE5] select-none">
            TRACE
          </span>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-white leading-relaxed">
            All your unread articles, links and tweets, finally somewhere other than your guilty conscience.
          </p>
          <p className="text-xs text-[#AFDDE5]">
            (Disclaimer: For people who open 47 tabs and close none of them.)
          </p>
        </div>
        <p className="text-xs text-[#024950] mt-8">© {new Date().getFullYear()} TRACE</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f8f9] px-6 py-12">
        {/* Mobile wordmark + tagline */}
        <div className="md:hidden mb-8 w-full max-w-sm">
          <p className="text-[20vw] font-black tracking-tighter leading-none text-[#003135] mb-4">
            TRACE
          </p>
          <p className="text-sm text-[#024950] leading-relaxed">
            All your unread articles, links and tweets, finally somewhere other than your guilty conscience.
          </p>
          <p className="text-xs text-[#0FA4AF] mt-1">
            (Disclaimer: For people who open 47 tabs and close none of them.)
          </p>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-[#003135] mb-1">Sign in</h1>
          <p className="text-sm text-[#0FA4AF] mb-8">Welcome back.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#024950] mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[rgba(0,49,53,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA4AF] bg-white text-[#003135]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#024950] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[rgba(0,49,53,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA4AF] bg-white text-[#003135]"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#024950] hover:bg-[#003135] text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-[#8b8b8b]">
            No account?{' '}
            <Link to="/register" className="text-[#0FA4AF] font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
