import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTags, deleteTag } from '../api/tags';

export default function MobileFilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(token),
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id) => deleteTag(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const tags = data?.tags || [];
  const activeTag = searchParams.get('tag');
  const starred = searchParams.get('starred') === 'true';
  const unread = searchParams.get('unread') === 'true';
  const signalOnly = searchParams.get('content_type') === 'signal';
  const onArchive = location.pathname === '/archive';
  const onFeed = location.pathname === '/';
  const hasActiveFilters = activeTag || starred || unread || signalOnly || onArchive;

  function setFilter(key, value) {
    if (location.pathname !== '/') navigate('/');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }

  return (
    <div className="md:hidden bg-white border-b border-[rgba(0,49,53,0.08)]">
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
        <Chip label="All" active={onFeed && !hasActiveFilters} onClick={() => { navigate('/'); setSearchParams({}); }} />
        <Chip label="★ Starred" active={starred} onClick={() => setFilter('starred', starred ? null : 'true')} />
        <Chip label="Unread" active={unread} onClick={() => setFilter('unread', unread ? null : 'true')} />
        <Chip label="📨 Signal" active={signalOnly} onClick={() => setFilter('content_type', signalOnly ? null : 'signal')} />
        <Chip label="Archive" active={onArchive} onClick={() => navigate('/archive')} />
        {tags.map(tag => {
          const isActive = activeTag === tag.name;
          return (
            <div key={tag.id} className="relative shrink-0">
              <button
                onClick={() => setFilter('tag', isActive ? null : tag.name)}
                className={`flex items-center gap-1.5 pl-3 pr-6 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#024950] text-white'
                    : 'bg-[rgba(0,49,53,0.06)] text-[#024950] hover:bg-[rgba(0,49,53,0.10)]'
                }`}
              >
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </button>
              <button
                onClick={() => deleteTagMutation.mutate(tag.id)}
                disabled={deleteTagMutation.isPending}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-xs leading-none transition-colors disabled:opacity-30 ${
                  isActive
                    ? 'text-[rgba(255,255,255,0.55)] hover:text-white'
                    : 'text-[#c8c8c8] hover:text-red-400'
                }`}
                title="Delete tag"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-[#024950] text-white'
          : 'bg-[rgba(0,49,53,0.06)] text-[#024950] hover:bg-[rgba(0,49,53,0.10)]'
      }`}
    >
      {label}
    </button>
  );
}
