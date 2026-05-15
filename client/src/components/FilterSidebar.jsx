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
    <aside className="w-48 shrink-0 pr-6">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Filters</p>
          <div className="space-y-1">
            <button
              onClick={() => { navigate('/'); setSearchParams({}); }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${onFeed && !hasActiveFilters ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All links
            </button>
            <button
              onClick={() => setFilter('starred', starred ? null : 'true')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${starred ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              ★ Starred
            </button>
            <button
              onClick={() => setFilter('unread', unread ? null : 'true')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${unread ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              ○ Unread
            </button>
            <button
              onClick={() => navigate('/archive')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${onArchive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              ⊘ Archive
            </button>
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</p>
            <div className="space-y-1">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setFilter('tag', activeTag === tag.name ? null : tag.name)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${activeTag === tag.name ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear filters
          </button>
        )}
      </div>
    </aside>
  );
}
