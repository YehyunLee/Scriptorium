import { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth_context";
import { useSearchParams } from "next/navigation";

export default function DeleteBlog() {
  const { isAuthenticated } = useAuth();
  let searchParams = useSearchParams()

  let blogId = searchParams.get("blogId") ?? ""

  const [isDeleted, setIsDeleted] = useState<Boolean>(false)
  const [blogInfo, setBlogInfo] = useState<any>({ title: "", content: "", tags: "", codeTemplateIds: [] })

  const [responseMessage, setResponseMessage] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  const [loadingQuery, setLoadingQuery] = useState(false);

  useEffect(() => {
    if (blogId != "") {
      getBlogInformation();
      setResponseMessage({ message: "", type: null })
    } else {
        setResponseMessage({
            message: "The blog selected is invalid",
            type: "error",
        });
    }
  }, [blogId]);

  const getBlogInformation = async () => {
    try {
        const response = await fetch(
            `/api/blog/${blogId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            setBlogInfo({ title: data.title, content: data.content, tags: data.tags, codeTemplateIds: data.codeTemplateIds })
        } else {
            const errorData = await response.json();
            setResponseMessage({
                message: `Error: ${errorData.message || "Failed to get blog post"}`,
                type: "error",
            });
        }
    } catch (err: any) {
        setResponseMessage({ message: `Error: ${err.message}`, type: "error" });
    }
  }

  const onDeleteBlogPost = async () => {
    setLoadingQuery(true);
    setResponseMessage({ message: "", type: null });

    if (isAuthenticated && blogId != "") {
        try {
            const token = localStorage.getItem("accessToken")
            const response = await fetch(`/api/blog/delete/${blogId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            });

            if (response.ok) {
                setIsDeleted(true)
                setResponseMessage({ message: "Blog post deleted successfully!", type: "success" });
            } else {
                const error = await response.json();
                setResponseMessage({
                    message: `Error: ${error.message || "Failed to delete blog post"}`,
                    type: "error",
                });
            }
        } catch (err: any) {
            setResponseMessage({ message: `Error: ${err.message}`, type: "error" });
        } finally {
            setLoadingQuery(false);
        }
    } else {
        alert("You must be logged in and viewing a valid blog to delete the blog")
    }
  };

  return (
    <div className="min-h-screen bg-navy p-12">
        <div className="max-w-3xl mx-auto px-4">
            <div className="bg-navy/50 border border-gold/30 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gold">
                    Delete Blog Post
                </h2>

                {(!(isDeleted) && blogId) &&
                    <>
                        <p className="mt-18 text-gold">Are you sure you would like to delete the following blog post:</p>
                        <div className="mt-12 border border-gold/30 rounded-lg p-4">
                            <h2 className="text-2xl font-bold text-gold">{blogInfo.title}</h2>
                            <p className="text-gold/90 mt-2">{blogInfo.content}</p>
                            <div className="mt-4 text-sm text-gold/50">
                                <p>
                                    <span className="font-bold">Tags:</span> {blogInfo.tags || "None"}
                                </p>
                                <p>
                                    <span className="font-bold">Templates:</span>{" "}
                                    {blogInfo.codeTemplates || "None"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                onClick={onDeleteBlogPost}
                                disabled={loadingQuery}
                                className="w-full bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                            >
                                {loadingQuery ? "Deleting..." : "Delete Blog Post"}
                            </button>
                        </div>
                    </>
                }
                
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