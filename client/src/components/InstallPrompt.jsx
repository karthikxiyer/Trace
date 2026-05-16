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
    <div className="flex items-center gap-3 bg-neutral-900 rounded-xl px-4 py-3 mb-4 text-sm">
      <span className="text-neutral-300 flex-1 text-xs">Install Trace for faster access and offline support.</span>
      <button
        onClick={install}
        className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-medium hover:bg-neutral-100 transition-colors"
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-neutral-500 hover:text-neutral-300 text-lg leading-none transition-colors"
      >
        ×
      </button>
    </div>
  );
}
