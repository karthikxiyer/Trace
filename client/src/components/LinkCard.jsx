import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateLink, deleteLink, getNotes, addNote } from '../api/links';
import { removeTagFromLink } from '../api/tags';
import TagBadge from './TagBadge';
import AddTagInput from './AddTagInput';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function LinkCard({ link }) {
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  function invalidateLinks() {
    queryClient.invalidateQueries({ queryKey: ['links'] });
    queryClient.invalidateQueries({ queryKey: ['search'] });
  }

  const update = useMutation({
    mutationFn: (fields) => updateLink(token, link.id, fields),
    onSuccess: invalidateLinks,
  });

  const remove = useMutation({
    mutationFn: () => deleteLink(token, link.id),
    onSuccess: invalidateLinks,
  });

  const removeTag = useMutation({
    mutationFn: (tagId) => removeTagFromLink(token, tagId, link.id),
    onSuccess: invalidateLinks,
  });

  const { data: notesData } = useQuery({
    queryKey: ['notes', link.id],
    queryFn: () => getNotes(token, link.id),
    enabled: notesOpen,
  });

  const addNoteMutation = useMutation({
    mutationFn: (content) => addNote(token, link.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', link.id] });
      setNoteText('');
    },
  });

  const image = link.og_image || `https://www.google.com/s2/favicons?domain=${link.domain}&sz=64`;
  const title = link.title || link.domain;

  return (
    <div className={`bg-white rounded-xl border border-neutral-100 p-3.5 sm:p-4 transition-opacity ${link.archived ? 'opacity-50' : ''}`}>
      <div className="flex gap-3 sm:gap-4">
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img
            src={image}
            alt=""
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover bg-neutral-100"
            onError={e => { e.target.src = `https://www.google.com/s2/favicons?domain=${link.domain}&sz=64`; }}
          />
        </a>

        <div className="flex-1 min-w-0">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-900 hover:text-indigo-600 line-clamp-1 block text-sm sm:text-base transition-colors"
          >
            {title}
          </a>
          {link.description && (
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">{link.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">{link.domain}</span>
            <span className="text-xs text-neutral-400">{timeAgo(link.created_at)}</span>
            {(link.tags || []).map(tag => (
              <TagBadge key={tag.id} tag={tag} onRemove={t => removeTag.mutate(t.id)} />
            ))}
            <AddTagInput link={link} />
            <button
              onClick={() => navigate(`/reader/${link.id}`)}
              title="Reader view"
              className="text-xs text-neutral-400 hover:text-indigo-600 transition-colors ml-0.5"
            >
              📖
            </button>
            <button
              onClick={() => setNotesOpen(o => !o)}
              className={`text-xs px-1.5 py-0.5 rounded border border-dashed transition-colors ${notesOpen ? 'border-indigo-300 text-indigo-600' : 'border-neutral-300 text-neutral-400 hover:border-neutral-400'}`}
            >
              {notesOpen ? 'hide notes' : 'notes'}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-0.5 shrink-0">
          <button
            onClick={() => update.mutate({ starred: !link.starred })}
            title={link.starred ? 'Unstar' : 'Star'}
            className={`p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-base leading-none ${link.starred ? 'text-amber-400' : 'text-neutral-200'}`}
          >
            ★
          </button>
          <button
            onClick={() => update.mutate({ archived: !link.archived })}
            title={link.archived ? 'Unarchive' : 'Archive'}
            className={`p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-sm ${link.archived ? 'text-indigo-500' : 'text-neutral-300'}`}
          >
            ⊘
          </button>
          <button
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
            className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-400 transition-colors text-sm disabled:opacity-40"
          >
            ✕
          </button>
        </div>
      </div>

      {notesOpen && (
        <div className="mt-3.5 pt-3.5 border-t border-neutral-100">
          {(notesData?.notes || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {notesData.notes.map(note => (
                <div key={note.id} className="text-sm text-neutral-700 bg-amber-50 rounded-lg px-3 py-2">
                  <p>{note.content}</p>
                  <p className="text-xs text-neutral-400 mt-1">{timeAgo(note.created_at)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note…"
              rows={2}
              className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button
              onClick={() => { if (noteText.trim()) addNoteMutation.mutate(noteText.trim()); }}
              disabled={!noteText.trim() || addNoteMutation.isPending}
              className="px-3 py-2 bg-neutral-900 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-neutral-800 self-end transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
