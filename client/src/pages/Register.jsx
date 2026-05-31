import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

export default function Register() {
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
      const { token } = await register(email, password);
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
        <div className="flex-1 flex flex-col items-start justify-center gap-6">
          <img src="/logo.jpeg" alt="TRACE" className="w-[10vw] min-w-[80px] rounded-2xl" />
          <span className="text-[6vw] font-black tracking-tighter leading-none text-[#AFDDE5] select-none">
            TRACE
          </span>
        </div>
        <div>
          <p className="text-sm text-white leading-relaxed">Start saving what matters.</p>
          <p className="text-xs text-[#AFDDE5] mt-2">Your reading list, finally under control.</p>
        </div>
        <p className="text-xs text-[#024950] mt-8">© {new Date().getFullYear()} TRACE</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f8f9] px-6 py-12">
        {/* Mobile wordmark */}
        <div className="md:hidden mb-8 w-full max-w-sm">
          <img src="/logo.jpeg" alt="TRACE" className="w-16 h-16 rounded-xl mb-3 object-cover" />
          <p className="text-[14vw] font-black tracking-tighter leading-none text-[#003135] mb-3">
            TRACE
          </p>
          <p className="text-sm text-[#024950]">Start saving what matters.</p>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-[#003135] mb-1">Create account</h1>
          <p className="text-sm text-[#0FA4AF] mb-8">Start saving what matters.</p>

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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[rgba(0,49,53,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA4AF] bg-white text-[#003135]"
              />
              <p className="text-xs text-[#8b8b8b] mt-1">Minimum 8 characters</p>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#024950] hover:bg-[#003135] text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-[#8b8b8b]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0FA4AF] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
