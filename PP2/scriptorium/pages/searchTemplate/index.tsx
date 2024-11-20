import { useState } from "react";

export default function SearchTemplates() {
  const [searchQueryString, setSearchQueryString] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([{id: "1", title: "Title", explanation: "explanation", tags: "tags", content: "content"}, {id: "2", title: "Title", explanation: "explanation", tags: "tags", content: "content"}]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const handleSearch = async () => {

  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 flex flex-col items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Search Templates</h2>

        <div className="mb-4 flex">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQueryString}
            onChange={(e) => setSearchQueryString(e.target.value)}
            className="w-full text-black rounded-l-md border-gray-300 shadow-sm focus:ring-navy focus:border-navy sm:text-sm px-4 py-2"
          />
          <button
            onClick={handleSearch}
            className="bg-navy text-white px-4 py-2 rounded-r-md shadow-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-navy"
          >
            Search
          </button>
        </div>

        <div>
          {templates.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {templates.map((template) => (
                <li key={template.id} className="p-4 cursor-pointer hover:bg-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">{template.title}</h3>
                  <p className="text-sm text-gray-600">{template.explanation}</p>
                  <div className="text-sm text-gray-500 mt-1">Tags: {template.tags}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">No templates found</p>
          )}
        </div>

        {templates.length > 0 && (
          <div className="mt-4 flex justify-between">
            <button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className={`px-4 py-2 bg-navy rounded-md shadow-sm ${
                page === 1 ? "cursor-not-allowed opacity-50" : "hover:opacity-80"
              }`}
            >
              Previous
            </button>
            <button
              disabled={templates.length < limit}
              onClick={() => handlePageChange(page + 1)}
              className={`px-4 py-2 bg-navy rounded-md shadow-sm ${
                templates.length < limit ? "cursor-not-allowed opacity-50" : "hover:opacity-80"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

