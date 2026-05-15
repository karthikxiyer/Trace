import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTags, createTag, addTagToLink, removeTagFromLink } from '../api/tags';

const PALETTE = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#06b6d4'];

export default function AddTagInput({ link }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const ref = useRef(null);
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(token),
  });

  const allTags = data?.tags || [];
  const appliedIds = new Set((link.tags || []).map(t => t.id));

  const filtered = allTags.filter(t =>
    t.name.toLowerCase().includes(input.toLowerCase())
  );
  const canCreate = input.trim() && !allTags.find(t => t.name.toLowerCase() === input.trim().toLowerCase());

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['links'] });
    queryClient.invalidateQueries({ queryKey: ['search'] });
  }

  const addMutation = useMutation({
    mutationFn: (tagId) => addTagToLink(token, tagId, link.id),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (tagId) => removeTagFromLink(token, tagId, link.id),
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: async (name) => {
      const color = PALETTE[allTags.length % PALETTE.length];
      const { tag } = await createTag(token, name, color);
      await addTagToLink(token, tag.id, link.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      invalidate();
      setInput('');
    },
  });

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded border border-dashed border-gray-300 hover:border-gray-400"
      >
        + tag
      </button>

      {open && (
        <div className="absolute left-0 top-6 z-20 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Search or create…"
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <div className="max-h-40 overflow-y-auto space-y-0.5">
            {filtered.map(tag => (
              <button
                key={tag.id}
                onClick={() => appliedIds.has(tag.id) ? removeMutation.mutate(tag.id) : addMutation.mutate(tag.id)}
                className="flex items-center gap-2 w-full px-2 py-1 rounded-lg hover:bg-gray-50 text-xs text-left"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                <span className="flex-1">{tag.name}</span>
                {appliedIds.has(tag.id) && <span className="text-indigo-500">✓</span>}
              </button>
            ))}
            {canCreate && (
              <button
                onClick={() => createMutation.mutate(input.trim())}
                className="flex items-center gap-2 w-full px-2 py-1 rounded-lg hover:bg-indigo-50 text-xs text-indigo-600"
              >
                + Create "{input.trim()}"
              </button>
            )}
            {!filtered.length && !canCreate && (
              <p className="text-xs text-gray-400 px-2 py-1">No tags found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
