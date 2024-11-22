import { useState } from "react";
import { useAuth } from "../contexts/auth_context";
import { TagInput } from "../../components/TagInput";


// pages/create-template.tsx
export default function CreateTemplate() {
  const { isAuthenticated } = useAuth();
  const [tags, setTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    explanation: "",
    content: "",
  });
  const [responseMessage, setResponseMessage] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResponseMessage({ message: "", type: null });

    if (!isAuthenticated) {
      alert("You must be logged in to create a template");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/code_template/user/create_template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags // Backend expects array
        }),
      });

      if (response.ok) {
        setResponseMessage({
          message: "Template created successfully!",
          type: "success",
        });
        // Reset form
        setFormData({ title: "", explanation: "", content: "" });
        setTags([]);
      } else {
        const error = await response.json();
        setResponseMessage({
          message: `Error: ${error.message || "Failed to create template"}`,
          type: "error",
        });
      }
    } catch (error: any) {
      setResponseMessage({
        message: `Error: ${error.message}`,
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-navy py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-navy/50 border border-gold/30 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gold">
            Create a Code Template
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gold mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold"
                placeholder="Enter template title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold mb-1">
                Tags
              </label>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold mb-1">
                Explanation
              </label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold"
                placeholder="Explain your template"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={8}
                className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold font-mono"
                placeholder="Write your code here"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            >
              Create Template
            </button>
          </form>

          {responseMessage.message && (
            <div
              className={`mt-4 p-3 rounded ${
                responseMessage.type === "success"
                  ? "bg-green-500/10 text-green-500 border border-green-500"
                  : "bg-red-500/10 text-red-500 border border-red-500"
              }`}
            >
              {responseMessage.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}