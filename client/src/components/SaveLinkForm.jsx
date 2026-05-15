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
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        required
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {mutation.isPending ? 'Saving…' : 'Save link'}
      </button>
      {mutation.isError && (
        <p className="text-sm text-red-600 mt-1 absolute">{mutation.error.message}</p>
      )}
    </form>
  );
}
