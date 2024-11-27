import { useState } from "react";
import { useAuth } from "../../utils/contexts/auth_context";
import { TagInput } from "../../components/TagInput";

export default function CreateBlog() {
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<any>({
    title: "",
    content: "",
    codeTemplateIds: [],
  });
  
  // Separate tags state
  const [tags, setTags] = useState<string[]>([]);
  
  const [responseMessage, setResponseMessage] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  const [loadingQuery, setLoadingQuery] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCodeTemplateIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
  // Split by comma, trim whitespace, filter empty strings, convert to numbers
  const ids = value
    .split(",")
    .map(id => id.trim())
    .filter(id => id !== '')
    .map(id => parseInt(id))
    .filter(id => !isNaN(id));
    
    setFormData({ ...formData, codeTemplateIds: ids });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingQuery(true);
    setResponseMessage({ message: "", type: null });

    if (isAuthenticated) {
        try {
            const token = localStorage.getItem("accessToken")
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + "/api/blog", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
          title: formData.title,
          content: formData.content,
                    tags: tags.join(", "), 
          // Send array of numbers directly
          codeTemplateIds: formData.codeTemplateIds
                }),
            });

            if (response.ok) {
                setResponseMessage({ message: "Blog post created successfully!", type: "success" });
                setFormData({ title: "", content: "", codeTemplateIds: [] });
                setTags([]); // Reset tags
            } else {
                const error = await response.json();
                setResponseMessage({
                    message: `Error: ${error.message || "Failed to create blog post"}`,
                    type: "error",
                });
            }
        } catch (err: any) {
            setResponseMessage({ message: `Error: ${err.message}`, type: "error" });
        } finally {
            setLoadingQuery(false);
        }
    } else {
        alert("You must be logged in to create a blog")
    }
  };

  return (
    <div className="min-h-screen bg-navy p-12">
        <div className="max-w-3xl mx-auto px-4">
            <div className="bg-navy/50 border border-gold/30 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gold">
                    Create a Blog Post
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gold mb-1">
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
                            className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold"
                        />
                    </div>
                
                    <div className="mb-4">
                        <label htmlFor="content" className="block text-sm font-medium text-gold mb-1">
                            Content
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            placeholder="Write your blog content"
                            rows={6}
                            className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gold mb-1">
                            Tags
                        </label>
                        <TagInput
                            tags={tags}
                            onTagsChange={setTags}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="codeTemplateIds" className="block text-sm font-medium text-gold mb-1">
                            Code Template IDs (comma-separated) [optional]
                        </label>
                        <input
                            type="text"
                            id="codeTemplateIds"
                            name="codeTemplateIds"
                            onChange={handleCodeTemplateIdsChange}
                            placeholder="e.g., template1, template2"
                            className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold"
                        />
                    </div>
                    
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={loadingQuery}
                            className="w-full bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                        >
                            {loadingQuery ? "Creating..." : "Create Blog Post"}
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
    </div>
  );
}