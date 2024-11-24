import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Template } from '@/types/general';

const parseTags = (tags: string): string[] => {
  return tags ? tags.split(',').map(tag => tag.trim()) : [];
};

export default function SearchTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/code_template/visitor/search_template?search=${search}&page=${page}&limit=${limit}`
      );
      const data = await response.json();
      setTemplates(data.templates);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [search, page]);

  return (
    <div className="min-h-screen bg-navy pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-96 px-4 py-2 bg-navy/50 border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold"
          />
        </div>

        {loading ? (
          <div className="text-center text-gold">Loading...</div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-navy/50 border border-gold/30 rounded-lg p-6 hover:border-gold transition-colors"
                >
                  <Link href={`/template/${template.id}`}>
                    <h3 className="text-xl font-semibold text-gold mb-2">{template.title}</h3>
                    <p className="text-white/80 mb-4 line-clamp-2">{template.explanation}</p>
                    <div className="flex flex-wrap gap-2">
                      {parseTags(template.tags).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gold/10 text-gold rounded-md text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-md ${
                    page === i + 1
                      ? 'bg-gold text-navy'
                      : 'bg-navy/50 text-gold border border-gold/30 hover:border-gold'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}