import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLinks } from '../api/links';
import LinkCard from '../components/LinkCard';
import SkeletonCard from '../components/SkeletonCard';
import SaveLinkForm from '../components/SaveLinkForm';
import InstallPrompt from '../components/InstallPrompt';

export default function Feed() {
  const [page, setPage] = useState(0);
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem('token');

  const filters = {};
  if (searchParams.get('tag')) filters.tag = searchParams.get('tag');
  if (searchParams.get('starred') === 'true') filters.starred = 'true';
  if (searchParams.get('unread') === 'true') filters.unread = 'true';

  const [pollInterval, setPollInterval] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['links', page, filters],
    queryFn: () => getLinks(token, page, filters),
    refetchInterval: pollInterval,
  });

  useEffect(() => {
    setPollInterval(data?.links?.some(l => !l.title) ? 3000 : false);
  }, [data]);

  return (
    <div>
      <InstallPrompt />
      <SaveLinkForm />

      {isLoading && (
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && data?.links?.length === 0 && (
        <div className="text-center py-20 text-[#c8c8c8]">
          <p className="text-3xl mb-3">🔗</p>
          <p className="text-sm">No links here yet.</p>
        </div>
      )}

      {!isLoading && data?.links?.length > 0 && (
        <>
          <div className="space-y-2.5">
            {data.links.map(link => <LinkCard key={link.id} link={link} />)}
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm text-[#4f4f4f] border border-[rgba(0,49,53,0.12)] rounded-lg disabled:opacity-40 hover:bg-[rgba(0,49,53,0.04)] transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-[#c8c8c8]">Page {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.hasMore}
              className="px-3 py-1.5 text-sm text-[#4f4f4f] border border-[rgba(0,49,53,0.12)] rounded-lg disabled:opacity-40 hover:bg-[rgba(0,49,53,0.04)] transition-colors"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
