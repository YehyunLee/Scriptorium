import Blog from "@/components/Blog";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { truncateText } from "@/utils/textUtils";

export default function SearchBlogs() {
  const [searchQueryString, setSearchQueryString] = useState<string>("");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loadingQuery, setLoadingQuery] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const router = useRouter();

  const handleSearch = async () => {
    setLoadingQuery(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` +
          `/api/blog?search=${encodeURIComponent(
            searchQueryString
          )}&page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch blogs");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoadingQuery(false);
    }
  };

  // call the handleSearch function for the initial load
  useEffect(() => {
    handleSearch();
  }, []);
  // use effect with [] as second argument to call the handleSearch function only once when the component is mounted
  // useEffect with variables as second argument to call the handleSearch function whenever the searchQueryString or page changes

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleSearch();
  };

  const handleBlogClick = (blog: any) => {
    setSelectedBlog({
      id: blog.id,
      authorId: blog.authorId,
      title: blog.title,
      content: blog.content,
      tags: blog.tags,
      codeTemplates: Array.isArray(blog.codeTemplates)
        ? blog.codeTemplates
        : [],
    });
  };

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-navy dark:text-gold p-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-navy/50 border border-gold/30 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gold">
                  Search Blogs
                </h2>

          <div className="mb-4 flex">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQueryString}
              onChange={(e) => setSearchQueryString(e.target.value)}
              className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold"
            />
            <button
              onClick={handleSearch}
              disabled={loadingQuery}
              className="bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            >
              {loadingQuery ? "Searching..." : "Search"}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            {blogs.length > 0 ? (
              <ul className="divide-y divide-gold">
                {blogs.map((blog) => (
                  <li
                    key={blog.id}
                    className="p-4 cursor-pointer hover:bg-gray-600"
                    onClick={() => handleBlogClick(blog)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gold">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-gold/90">
                          {truncateText(blog.content, 25)}
                        </p>
                        <div className="text-sm text-gold/50 mt-1">
                          Tags: {blog.tags}
                        </div>
                        <div className="text-sm text-gold/50 mt-1">
                          Templates:{" "}
                          {blog.codeTemplates?.length === 0 ? (
                            "None"
                          ) : (
                            <div className="inline-flex gap-2">
                              {blog.codeTemplates.map((template: any) => (
                                <Link
                                  key={template.id}
                                  href={`/template/${template.id}`}
                                  className="text-gold hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {template.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/blog/${blog.id}`}
                        className="text-gold hover:text-gold/80 ml-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Full Screen →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              !loadingQuery && (
                <p className="text-gray-600 text-sm">No blogs found</p>
              )
            )}
          </div>

          {selectedBlog && (
            <Blog
              id={selectedBlog.id}
              authorId={selectedBlog.authorId}
              title={selectedBlog.title}
              content={selectedBlog.content}
              tags={selectedBlog.tags}
              codeTemplates={selectedBlog.codeTemplates}
              onCloseHandler={() => setSelectedBlog(null)}
            ></Blog>
          )}

          {blogs.length > 0 && (
            <div className="mt-4 flex justify-between">
              <button
                disabled={loadingQuery || page === 1}
                onClick={() => handlePageChange(page - 1)}
                className={`bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                  page === 1
                    ? "cursor-not-allowed opacity-50"
                    : "hover:opacity-80"
                }`}
              >
                Previous
              </button>
              <button
                disabled={loadingQuery || blogs.length < limit}
                onClick={() => handlePageChange(page + 1)}
                className={`bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                  blogs.length < limit
                    ? "cursor-not-allowed opacity-50"
                    : "hover:opacity-80"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
