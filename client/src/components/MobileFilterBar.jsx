import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTags } from '../api/tags';

export default function MobileFilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const { data } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(token),
  });

  const tags = data?.tags || [];
  const activeTag = searchParams.get('tag');
  const starred = searchParams.get('starred') === 'true';
  const unread = searchParams.get('unread') === 'true';
  const onArchive = location.pathname === '/archive';
  const onFeed = location.pathname === '/';
  const hasActiveFilters = activeTag || starred || unread || onArchive;

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
    <div className="md:hidden bg-white border-b border-neutral-100">
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
        <Chip
          label="All"
          active={onFeed && !hasActiveFilters}
          onClick={() => { navigate('/'); setSearchParams({}); }}
        />
        <Chip
          label="★ Starred"
          active={starred}
          onClick={() => setFilter('starred', starred ? null : 'true')}
        />
        <Chip
          label="Unread"
          active={unread}
          onClick={() => setFilter('unread', unread ? null : 'true')}
        />
        <Chip
          label="Archive"
          active={onArchive}
          onClick={() => navigate('/archive')}
        />
        {tags.map(tag => (
          <Chip
            key={tag.id}
            label={tag.name}
            active={activeTag === tag.name}
            color={tag.color}
            onClick={() => setFilter('tag', activeTag === tag.name ? null : tag.name)}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-neutral-900 text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
    >
      {color && (
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  );
}
