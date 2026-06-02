import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTags, deleteTag } from '../api/tags';

export default function FilterSidebar() {
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

  const hasActiveFilters = activeTag || starred || unread || signalOnly || onArchive;

  return (
    <aside className="w-44 shrink-0">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold text-[#0FA4AF] uppercase tracking-widest mb-2">Filters</p>
          <div className="space-y-0.5">
            <NavBtn label="All links" active={onFeed && !hasActiveFilters} onClick={() => { navigate('/'); setSearchParams({}); }} />
            <NavBtn label="★  Starred" active={starred} onClick={() => setFilter('starred', starred ? null : 'true')} />
            <NavBtn label="○  Unread" active={unread} onClick={() => setFilter('unread', unread ? null : 'true')} />
            <NavBtn label="📨  Signal" active={signalOnly} onClick={() => setFilter('content_type', signalOnly ? null : 'signal')} />
            <NavBtn label="Archive" active={onArchive} onClick={() => navigate('/archive')} />
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#0FA4AF] uppercase tracking-widest mb-2">Tags</p>
            <div className="space-y-0.5">
              {tags.map(tag => {
                const isActive = activeTag === tag.name;
                return (
                  <div
                    key={tag.id}
                    className={`group flex items-center rounded-lg overflow-hidden transition-colors ${
                      isActive ? 'bg-[#024950]' : 'hover:bg-[rgba(0,49,53,0.05)]'
                    }`}
                  >
                    <button
                      onClick={() => setFilter('tag', isActive ? null : tag.name)}
                      className={`flex-1 text-left px-3 py-1.5 text-sm flex items-center gap-2 ${
                        isActive ? 'text-white font-medium' : 'text-[#024950]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </button>
                    <button
                      onClick={() => deleteTagMutation.mutate(tag.id)}
                      disabled={deleteTagMutation.isPending}
                      className={`opacity-0 group-hover:opacity-100 pr-2.5 text-base leading-none transition-opacity disabled:opacity-30 ${
                        isActive
                          ? 'text-[rgba(255,255,255,0.45)] hover:text-white'
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
        )}

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-[#0FA4AF] hover:text-[#003135] transition-colors">
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
          ? 'bg-[#024950] text-white font-medium'
          : 'text-[#024950] hover:bg-[rgba(0,49,53,0.05)]'
      }`}
    >
      {label}
    </button>
  );
}
