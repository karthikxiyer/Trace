import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLinks } from '../api/links';
import LinkCard from '../components/LinkCard';
import SkeletonCard from '../components/SkeletonCard';

export default function Archive() {
  const [page, setPage] = useState(0);
  const token = localStorage.getItem('token');

  const { data, isLoading } = useQuery({
    queryKey: ['links', 'archive', page],
    queryFn: () => getLinks(token, page, { archived: true }),
  });

  return (
    <div>
      <h2 className="text-[11px] font-semibold text-[#c8c8c8] mb-4 uppercase tracking-widest">Archive</h2>

      {isLoading && (
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && data?.links?.length === 0 && (
        <div className="text-center py-20 text-[#c8c8c8]">
          <p className="text-sm">Nothing archived yet.</p>
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
