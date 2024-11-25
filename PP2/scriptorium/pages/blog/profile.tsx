import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../utils/contexts/auth_context';
import { parseTags } from '@/utils/helpers';

interface Blog {
  id: number;
  title: string;
  content: string;
  tags: string;
  createdAt: string;
  hidden: boolean;
}

export default function ProfileBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();
  const limit = 10;

  const fetchUserBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/blog?user_id=${user?.id}&page=${page}&limit=${limit}`
      );
      const data = await response.json();
      setBlogs(data.blogs);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
        console.log(3)
      fetchUserBlogs();
    }
  }, [user?.id, page]);

  return (
    <div className="min-h-screen bg-navy pt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gold">My Blog Posts</h1>
          <Link
            href="/blog/create"
            className="bg-gold text-navy px-4 py-2 rounded-md hover:bg-gold/90 transition-colors"
          >
            Create New Blog
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gold">Loading...</div>
        ) : (
          <>
            <div className="space-y-6">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-navy/50 border border-gold/30 rounded-lg p-6 hover:border-gold transition-colors"
                >
                  <Link href={`/blog/${blog.id}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gold">{blog.title}</h3>
                      {blog.hidden && (
                        <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-sm">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 mb-4 line-clamp-3">{blog.content}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {parseTags(blog.tags).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gold/10 text-gold rounded-md text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/60 text-sm">
                      Created: {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
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