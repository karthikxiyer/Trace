import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { saveLink } from '../api/links';

export default function Save() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('idle');
  const [manualUrl, setManualUrl] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const urlParam = searchParams.get('url');

  useEffect(() => {
    if (!urlParam) return;

    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/save?url=${urlParam}`)}`);
      return;
    }

    setStatus('saving');
    saveLink(token, urlParam)
      .then(() => {
        setStatus('saved');
        setTimeout(() => navigate('/'), 1500);
      })
      .catch(() => setStatus('error'));
  }, []);

  async function handleManualSave(e) {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    if (!token) { navigate('/login'); return; }

    setStatus('saving');
    try {
      await saveLink(token, manualUrl.trim());
      setStatus('saved');
      setTimeout(() => navigate('/'), 1500);
    } catch {
      setStatus('error');
    }
  }

  if (urlParam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fefefe] gap-3">
        <div className="bg-white rounded-2xl border border-[rgba(0,49,53,0.08)] p-8 w-full max-w-sm text-center">
          <h1 className="text-xl font-black tracking-tighter text-[#024950] mb-4">Trace</h1>
          {status === 'saving' && <p className="text-[#8b8b8b] text-sm">Saving link…</p>}
          {status === 'saved'  && <p className="text-green-600 text-sm font-medium">✓ Saved! Redirecting…</p>}
          {status === 'error'  && (
            <>
              <p className="text-red-500 text-sm mb-4">Failed to save. Try again.</p>
              <Link to="/" className="text-[#024950] text-sm hover:underline">Go to feed</Link>
            </>
          )}
          <p className="text-xs text-[#c8c8c8] mt-4 break-all">{urlParam}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fefefe]">
      <div className="bg-white rounded-2xl border border-[rgba(0,49,53,0.08)] p-8 w-full max-w-sm">
        <h1 className="text-xl font-black tracking-tighter text-[#024950] mb-6">Save a link</h1>
        <form onSubmit={handleManualSave} className="space-y-4">
          <input
            type="url"
            value={manualUrl}
            onChange={e => setManualUrl(e.target.value)}
            placeholder="https://…"
            required
            className="w-full px-3 py-2 border border-[rgba(0,49,53,0.12)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#024950] text-[#060508] placeholder:text-[#c8c8c8]"
          />
          <button
            type="submit"
            disabled={status === 'saving'}
            className="w-full py-2 bg-[#024950] hover:bg-[#1e3e3a] text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
          >
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
          {status === 'saved' && <p className="text-green-600 text-sm text-center">✓ Saved!</p>}
          {status === 'error'  && <p className="text-red-500 text-sm text-center">Failed to save.</p>}
        </form>
        <p className="mt-4 text-center">
          <Link to="/" className="text-sm text-[#024950] hover:underline">Back to feed</Link>
        </p>
      </div>
    </div>
  );
}
