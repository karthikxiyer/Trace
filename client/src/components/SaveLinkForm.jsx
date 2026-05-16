import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveLink } from '../api/links';

export default function SaveLinkForm() {
  const [url, setUrl] = useState('');
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (url) => saveLink(token, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setUrl('');
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    mutation.mutate(url.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="mb-5">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL to save…"
          required
          className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white placeholder:text-neutral-400"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
      {mutation.isError && (
        <p className="text-xs text-red-500 mt-1.5">{mutation.error.message}</p>
      )}
    </form>
  );
}
