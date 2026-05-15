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

  // Auto-save flow (from share target or PWA share)
  if (urlParam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Trace</h1>
          {status === 'saving' && <p className="text-gray-500 text-sm">Saving link…</p>}
          {status === 'saved'  && <p className="text-green-600 text-sm font-medium">✓ Saved! Redirecting…</p>}
          {status === 'error'  && (
            <>
              <p className="text-red-500 text-sm mb-4">Failed to save. Try again.</p>
              <Link to="/" className="text-indigo-600 text-sm hover:underline">Go to feed</Link>
            </>
          )}
          <p className="text-xs text-gray-400 mt-4 break-all">{urlParam}</p>
        </div>
      </div>
    );
  }

  // Manual save form (no URL param)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Save a link</h1>
        <form onSubmit={handleManualSave} className="space-y-4">
          <input
            type="url"
            value={manualUrl}
            onChange={e => setManualUrl(e.target.value)}
            placeholder="https://…"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={status === 'saving'}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
          >
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
          {status === 'saved' && <p className="text-green-600 text-sm text-center">✓ Saved!</p>}
          {status === 'error'  && <p className="text-red-500 text-sm text-center">Failed to save.</p>}
        </form>
        <p className="mt-4 text-center"><Link to="/" className="text-sm text-indigo-600 hover:underline">Back to feed</Link></p>
      </div>
    </div>
  );
}
