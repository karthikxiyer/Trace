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
    <div className={`bg-white rounded-xl border border-gray-200 p-4 transition-opacity ${link.archived ? 'opacity-60' : ''}`}>
      <div className="flex gap-4">
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img
            src={image}
            alt=""
            className="w-16 h-16 rounded-lg object-cover bg-gray-100"
            onError={e => { e.target.src = `https://www.google.com/s2/favicons?domain=${link.domain}&sz=64`; }}
          />
        </a>

        <div className="flex-1 min-w-0">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-900 hover:text-indigo-600 line-clamp-1 block"
          >
            {title}
          </a>
          {link.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{link.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{link.domain}</span>
            <span className="text-xs text-gray-400">{timeAgo(link.created_at)}</span>
            {(link.tags || []).map(tag => (
              <TagBadge key={tag.id} tag={tag} onRemove={t => removeTag.mutate(t.id)} />
            ))}
            <AddTagInput link={link} />
            <button
              onClick={() => navigate(`/reader/${link.id}`)}
              title="Reader view"
              className="text-xs text-gray-400 hover:text-indigo-600"
            >
              📖
            </button>
            <button
              onClick={() => setNotesOpen(o => !o)}
              className={`text-xs px-1.5 py-0.5 rounded border border-dashed transition-colors ${notesOpen ? 'border-indigo-300 text-indigo-600' : 'border-gray-300 text-gray-400 hover:border-gray-400'}`}
            >
              {notesOpen ? 'hide notes' : 'notes'}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-1 shrink-0">
          <button
            onClick={() => update.mutate({ starred: !link.starred })}
            title={link.starred ? 'Unstar' : 'Star'}
            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-lg leading-none ${link.starred ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
          <button
            onClick={() => update.mutate({ archived: !link.archived })}
            title={link.archived ? 'Unarchive' : 'Archive'}
            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm ${link.archived ? 'text-indigo-500' : 'text-gray-300'}`}
          >
            ⊘
          </button>
          <button
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors text-sm disabled:opacity-40"
          >
            ✕
          </button>
        </div>
      </div>

      {notesOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {(notesData?.notes || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {notesData.notes.map(note => (
                <div key={note.id} className="text-sm text-gray-700 bg-yellow-50 rounded-lg px-3 py-2">
                  <p>{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(note.created_at)}</p>
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
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={() => { if (noteText.trim()) addNoteMutation.mutate(noteText.trim()); }}
              disabled={!noteText.trim() || addNoteMutation.isPending}
              className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-indigo-700 self-end"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
