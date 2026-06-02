import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../api/base';

export default function SignalAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setError('Invalid link.'); return; }

    fetch(`${API_BASE}/api/auth/signal?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        localStorage.setItem('token', data.token);
        navigate('/', { replace: true });
      })
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f8f9]">
      <div className="bg-white rounded-2xl border border-[rgba(0,49,53,0.08)] p-8 w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto mb-4">
          <img src="/logo.jpeg" alt="" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-[#024950] mb-2">TRACE</h1>

        {!error && (
          <p className="text-sm text-[#8b8b8b]">Signing you in…</p>
        )}

        {error && (
          <>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <p className="text-xs text-[#8b8b8b]">
              Send <span className="font-mono font-medium text-[#024950]">login</span> to the bot for a new link.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
