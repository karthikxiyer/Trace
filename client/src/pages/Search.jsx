import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchLinks } from '../api/links';
import LinkCard from '../components/LinkCard';
import SkeletonCard from '../components/SkeletonCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const token = localStorage.getItem('token');

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchLinks(token, q),
    enabled: q.length > 0,
  });

  if (!q) {
    return (
      <div className="text-center py-20 text-[#c8c8c8]">
        <p className="text-sm">Start typing to search your links.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-[#c8c8c8] mb-4 uppercase tracking-widest">
        Results for <span className="text-[#024950] font-medium normal-case tracking-normal">"{q}"</span>
      </p>

      {isLoading && (
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && data?.results?.length === 0 && (
        <div className="text-center py-20 text-[#c8c8c8]">
          <p className="text-sm">No results found.</p>
        </div>
      )}

      {!isLoading && data?.results?.length > 0 && (
        <div className="space-y-2.5">
          {data.results.map(link => <LinkCard key={link.id} link={link} />)}
        </div>
      )}
    </div>
  );
}
