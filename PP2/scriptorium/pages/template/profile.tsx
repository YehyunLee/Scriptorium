import { useState } from "react";
import Link from "next/link";

export default function SearchTemplates() {
  const [searchQueryString, setSearchQueryString] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([
    {
      id: "1",
      title: "Title",
      explanation: "explanation",
      tags: "tags",
      content: "content",
    },
    {
      id: "2",
      title: "Title",
      explanation: "explanation",
      tags: "tags",
      content: "content",
    },
  ]);
  const [loadingQuery, setLoadingQuery] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const handleSearch = async () => {
    setLoadingQuery(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + `/api/code_template/user/search_template?search=${encodeURIComponent(
          searchQueryString
        )}&page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch templates");
        console.error(errorData);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoadingQuery(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleSearch();
  };

  // This part was done by Github Copilot to redesign the UI of the page
  return (
    <div className="min-h-screen bg-navy p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-8">
          {/* Search Header */}
          <div className="bg-navy/50 border border-gold/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-6">My Templates</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQueryString}
                onChange={(e) => setSearchQueryString(e.target.value)}
                className="flex-1 px-4 py-3 bg-navy/70 border border-gold/30 rounded-lg text-white 
                  placeholder:text-white/50 focus:ring-2 focus:ring-gold/50 focus:border-gold 
                  transition-all duration-200"
              />
              <button
                onClick={handleSearch}
                disabled={loadingQuery}
                className="px-6 py-3 bg-gold text-navy font-semibold rounded-lg 
                  hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-lg hover:shadow-gold/20"
              >
                {loadingQuery ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 border-2 border-navy/30 border-t-navy 
                      rounded-full animate-spin"
                    />
                    Searching...
                  </div>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="bg-red-500/10 border border-red-500 text-red-500 
              rounded-lg p-4 text-sm"
            >
              {error}
            </div>
          )}

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Link href={`/template/${template.id}`} key={template.id}>
                <div
                  className="bg-navy/50 border border-gold/30 rounded-lg p-6 
                  hover:border-gold hover:shadow-lg hover:shadow-gold/10 
                  transition-all duration-200 h-full flex flex-col"
                >
                  <h3 className="text-xl font-bold text-gold mb-3">
                    {template.title}
                  </h3>
                  <p className="text-white/80 mb-4 flex-grow line-clamp-3">
                    {template.explanation}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags
                      .split(",")
                      .map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gold/10 text-gold text-sm rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {!loadingQuery && templates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No templates found</p>
            </div>
          )}

          {/* Pagination */}
          {templates.length > 0 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                disabled={loadingQuery || page === 1}
                onClick={() => handlePageChange(page - 1)}
                className={`px-6 py-2 rounded-lg border border-gold/30 text-gold
                  ${
                    page === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gold/10 hover:border-gold"
                  } 
                  transition-all duration-200`}
              >
                ← Previous
              </button>
              <span className="flex items-center text-gold">Page {page}</span>
              <button
                disabled={loadingQuery || templates.length < limit}
                onClick={() => handlePageChange(page + 1)}
                className={`px-6 py-2 rounded-lg border border-gold/30 text-gold
                  ${
                    templates.length < limit
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gold/10 hover:border-gold"
                  } 
                  transition-all duration-200`}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
