import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLinkContent } from '../api/links';

export default function ReaderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const { data, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => getLinkContent(token, id),
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-[rgba(0,49,53,0.07)] px-4 py-3 flex items-center gap-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#8b8b8b] hover:text-[#060508] flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
      </header>

      <main className="px-4 py-10" style={{ maxWidth: 680, margin: '0 auto' }}>
        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-[rgba(0,49,53,0.06)] rounded w-3/4" />
            <div className="h-4 bg-[rgba(0,49,53,0.06)] rounded w-full" />
            <div className="h-4 bg-[rgba(0,49,53,0.06)] rounded w-5/6" />
            <div className="h-4 bg-[rgba(0,49,53,0.06)] rounded w-full" />
          </div>
        )}

        {!isLoading && !data?.content && (
          <div className="text-center py-20 text-[#c8c8c8]">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-sm">Reader mode isn't available for this link.</p>
            <p className="text-xs mt-1 text-[#d0d0d0]">The page may be paywalled, dynamic, or bot-protected.</p>
          </div>
        )}

        {!isLoading && data?.content && (
          <div
            className="reader-content"
            style={{ fontSize: '1.1rem', lineHeight: 1.75, color: '#003135' }}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        )}
      </main>

      <style>{`
        .reader-content h1, .reader-content h2, .reader-content h3 {
          font-weight: 700; margin: 1.5em 0 0.5em; line-height: 1.3; color: #003135;
        }
        .reader-content h1 { font-size: 1.6rem; }
        .reader-content h2 { font-size: 1.3rem; }
        .reader-content h3 { font-size: 1.1rem; }
        .reader-content p { margin: 0 0 1.2em; }
        .reader-content a { color: #0FA4AF; text-decoration: underline; }
        .reader-content img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
        .reader-content blockquote {
          border-left: 3px solid rgba(0,49,53,0.12); margin: 1.5em 0;
          padding-left: 1em; color: #8b8b8b; font-style: italic;
        }
        .reader-content pre {
          background: #fefefe; border: 1px solid rgba(0,49,53,0.08);
          border-radius: 8px; padding: 1em; overflow-x: auto; font-size: 0.9rem;
        }
        .reader-content ul, .reader-content ol { padding-left: 1.5em; margin-bottom: 1.2em; }
        .reader-content li { margin-bottom: 0.4em; }
      `}</style>
    </div>
  );
}
