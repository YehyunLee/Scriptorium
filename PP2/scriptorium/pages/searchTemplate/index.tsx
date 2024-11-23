import { useState } from "react";

export default function SearchTemplates() {
  const [searchQueryString, setSearchQueryString] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([{id: "1", title: "Title", explanation: "explanation", tags: "tags", content: "content"}, {id: "2", title: "Title", explanation: "explanation", tags: "tags", content: "content"}]);
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
        `/api/code_template/user/search_template?search=${encodeURIComponent(
          searchQueryString
        )}&page=${page}&limit=${limit}`,
        {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         }
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

  return (
    <div className="min-h-screen bg-navy p-12">
        <div className="max-w-3xl mx-auto px-4">
            <div className="bg-navy/50 border border-gold/30 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gold">
                  Search Templates
                </h2>

                <div className="mb-4 flex">
                  <input
                    type="text"
                    placeholder="Search templates..."
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
                  {templates.length > 0 ? (
                    <ul className="divide-y divide-gold">
                      {templates.map((template) => (
                        <li key={template.id} className="p-4 cursor-pointer hover:bg-gray-600">
                          <h3 className="text-lg font-bold text-gold">{template.title}</h3>
                          <p className="text-sm text-gold/90">{template.explanation}</p>
                          <div className="text-sm text-gold/50 mt-1">Tags: {template.tags}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    !loadingQuery && <p className="text-gray-600 text-sm">No templates found</p>
                  )}
                </div>

                {templates.length > 0 && (
                  <div className="mt-4 flex justify-between">
                    <button
                      disabled={loadingQuery || page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      className={`bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                        page === 1 ? "cursor-not-allowed opacity-50" : "hover:opacity-80"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      disabled={loadingQuery || templates.length < limit}
                      onClick={() => handlePageChange(page + 1)}
                      className={`bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                        templates.length < limit ? "cursor-not-allowed opacity-50" : "hover:opacity-80"
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
};



