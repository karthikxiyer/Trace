import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTags } from '../api/tags';

export default function FilterSidebar() {
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
  const onFeed = location.pathname === '/';
  const onArchive = location.pathname === '/archive';

  function setFilter(key, value) {
    if (location.pathname !== '/') navigate('/');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }

  function clearFilters() {
    navigate('/');
    setSearchParams({});
  }

  const hasActiveFilters = activeTag || starred || unread || onArchive;

  return (
    <aside className="w-44 shrink-0">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Filters</p>
          <div className="space-y-0.5">
            <NavBtn
              label="All links"
              active={onFeed && !hasActiveFilters}
              onClick={() => { navigate('/'); setSearchParams({}); }}
            />
            <NavBtn
              label="★  Starred"
              active={starred}
              onClick={() => setFilter('starred', starred ? null : 'true')}
            />
            <NavBtn
              label="○  Unread"
              active={unread}
              onClick={() => setFilter('unread', unread ? null : 'true')}
            />
            <NavBtn
              label="Archive"
              active={onArchive}
              onClick={() => navigate('/archive')}
            />
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Tags</p>
            <div className="space-y-0.5">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setFilter('tag', activeTag === tag.name ? null : tag.name)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    activeTag === tag.name
                      ? 'bg-neutral-900 text-white font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
            Clear filters
          </button>
        )}
      </div>
    </aside>
  );
}

function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-neutral-900 text-white font-medium'
          : 'text-neutral-600 hover:bg-neutral-100'
      }`}
    >
      {label}
    </button>
  );
}
