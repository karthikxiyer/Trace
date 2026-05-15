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
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && data?.links?.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔗</p>
          <p className="text-sm">No links here yet.</p>
        </div>
      )}

      {!isLoading && data?.links?.length > 0 && (
        <>
          <div className="space-y-3">
            {data.links.map(link => <LinkCard key={link.id} link={link} />)}
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400">Page {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.hasMore}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
