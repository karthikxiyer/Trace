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
    <div className="flex items-center gap-3 bg-[#024950] rounded-xl px-4 py-3 mb-4 text-sm">
      <span className="text-[#AFDDE5] flex-1 text-xs">Install Trace for faster access and offline support.</span>
      <button
        onClick={install}
        className="px-3 py-1.5 bg-[#AFDDE5] text-[#024950] rounded-lg text-xs font-medium hover:bg-white transition-colors"
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-[rgba(255,255,255,0.4)] hover:text-white text-lg leading-none transition-colors"
      >
        ×
      </button>
    </div>
  );
}
