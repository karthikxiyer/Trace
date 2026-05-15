import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed) return null;

  async function install() {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setPrompt(null);
    else setDismissed(true);
  }

  return (
    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-4 text-sm">
      <span className="text-indigo-700 flex-1">Install Trace for faster access and offline support.</span>
      <button
        onClick={install}
        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 hover:text-gray-600 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
