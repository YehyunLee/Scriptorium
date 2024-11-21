import { useState } from "react";
import { useAuth } from "../contexts/auth_context";

export default function CreateBlog() {
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<any>({
    title: "",
    content: "",
    tags: "",
    codeTemplateIds: [],
  });
  
  const [responseMessage, setResponseMessage] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCodeTemplateIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const ids = value.split(",").map((id) => id.trim());
    setFormData({ ...formData, codeTemplateIds: ids });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResponseMessage({ message: "", type: null });

    if (isAuthenticated) {
        try {
        const response = await fetch("/api/blog", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            setResponseMessage({ message: "Blog post created successfully!", type: "success" });
            setFormData({ title: "", content: "", tags: "", codeTemplateIds: [] }); // Reset form
        } else {
            const error = await response.json();
            setResponseMessage({
            message: `Error: ${error.message || "Failed to create blog post"}`,
            type: "error",
            });
        }
        } catch (err: any) {
            setResponseMessage({ message: `Error: ${err.message}`, type: "error" });
        } 
    } else {
        alert("You must be logged in to create a template")
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a Blog Post</h2>
        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter title"
              required
              className="mt-1 p-2 text-black block w-full rounded-md border-gray-300 shadow-sm focus:ring-navy focus:border-navy sm:text-sm"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your blog content"
              rows={6}
              className="mt-1 p-2 text-black block w-full rounded-md border-gray-300 shadow-sm focus:ring-navy focus:border-navy sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., JavaScript, Python, C"
              className="mt-1 p-2 text-black block w-full rounded-md border-gray-300 shadow-sm focus:ring-navy focus:border-navy sm:text-sm"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="codeTemplateIds" className="block text-sm font-medium text-gray-700">
              Code Template IDs (comma-separated) [optional]
            </label>
            <input
              type="text"
              id="codeTemplateIds"
              name="codeTemplateIds"
              onChange={handleCodeTemplateIdsChange}
              placeholder="e.g., template1, template2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-navy focus:border-navy sm:text-sm"
            />
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-navy text-white py-2 px-4 rounded-md shadow-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
            >
              Create Blog Post
            </button>
          </div>
        </form>
        
        {responseMessage.message && (
          <div
            className={`mt-4 text-center ${
              responseMessage.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {responseMessage.message}
          </div>
        )}
      </div>
    </div>
  );
};
