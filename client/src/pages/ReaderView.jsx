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
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
        >
          ← Back
        </button>
      </header>

      <main className="px-4 py-10" style={{ maxWidth: 680, margin: '0 auto' }}>
        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        )}

        {!isLoading && !data?.content && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-sm">Reader mode isn't available for this link.</p>
            <p className="text-xs mt-1 text-gray-300">The page may be paywalled, dynamic, or bot-protected.</p>
          </div>
        )}

        {!isLoading && data?.content && (
          <div
            className="reader-content"
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.75,
              color: '#1f2937',
            }}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        )}
      </main>

      <style>{`
        .reader-content h1, .reader-content h2, .reader-content h3 {
          font-weight: 600; margin: 1.5em 0 0.5em; line-height: 1.3;
        }
        .reader-content h1 { font-size: 1.6rem; }
        .reader-content h2 { font-size: 1.3rem; }
        .reader-content h3 { font-size: 1.1rem; }
        .reader-content p { margin: 0 0 1.2em; }
        .reader-content a { color: #6366f1; text-decoration: underline; }
        .reader-content img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
        .reader-content blockquote {
          border-left: 3px solid #e5e7eb; margin: 1.5em 0;
          padding-left: 1em; color: #6b7280; font-style: italic;
        }
        .reader-content pre {
          background: #f9fafb; border-radius: 8px; padding: 1em;
          overflow-x: auto; font-size: 0.9rem;
        }
        .reader-content ul, .reader-content ol {
          padding-left: 1.5em; margin-bottom: 1.2em;
        }
        .reader-content li { margin-bottom: 0.4em; }
      `}</style>
    </div>
  );
}
