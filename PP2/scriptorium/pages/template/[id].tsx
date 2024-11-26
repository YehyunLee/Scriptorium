import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Template } from "@/types/general";
import { EditorWrapper } from "@/components/EditorWrapper";
import { useAuth } from "@/utils/contexts/auth_context";

export default function TemplateDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editorType, setEditorType] = useState<"monaco" | "highlight">(
    "monaco"
  );
  const { user, api } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Template>>({});
  // Partial in TypeScript means that the object can have some properties of the type Template but not all of them

  const handleEdit = () => {
    setEditFormData({
      title: template?.title,
      content: template?.content,
      explanation: template?.explanation,
      tags: template?.tags,
      language: template?.language,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await api.put(
        `/code_template/user/edit_or_delete_template?id=${id}`,
        {
          ...editFormData,
        }
      );

      if (response.ok) {
        const updatedTemplate = await response.json();
        setTemplate(updatedTemplate.template);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update template:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(
        `/code_template/user/edit_or_delete_template?id=${id}`
      );
      if (response.ok) {
        router.push("/template/search");
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-navy border border-gold/30 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gold mb-4">Delete Template</h3>
        <p className="text-white/80 mb-6">
          Are you sure you want to delete this template? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-white/80 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Update header section to include edit/delete buttons for owners
  const isOwner = user?.id === template?.authorId;

  const EditorToggle = () => (
    <div className="flex items-center gap-2 mb-2">
      <button
        onClick={() => setEditorType("monaco")}
        className={`px-3 py-1 rounded-md text-sm transition-colors ${
          editorType === "monaco"
            ? "bg-gold text-navy"
            : "bg-gold/20 text-gold hover:bg-gold/30"
        }`}
      >
        Monaco Editor
      </button>
      <button
        onClick={() => setEditorType("highlight")}
        className={`px-3 py-1 rounded-md text-sm transition-colors ${
          editorType === "highlight"
            ? "bg-gold text-navy"
            : "bg-gold/20 text-gold hover:bg-gold/30"
        }`}
      >
        Simple Editor
      </button>
    </div>
  );

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/code_template/visitor/${id}`);
        if (!response.ok) throw new Error("Template not found");

        const data = await response.json();
        setTemplate(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load template"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleCopy = async () => {
    if (!template) return;

    await navigator.clipboard.writeText(template.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-navy p-8 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          {error || "Template not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-navy/50 border border-gold/30 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  className="text-3xl font-bold bg-navy/50 border border-gold/30 rounded-md px-2 py-1 text-gold mb-2"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gold mb-2">
                  {template.title}
                </h1>
              )}
              <p className="text-white/60">
                By {template.author.firstName} {template.author.lastName} •
                {new Date(template.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={editorType}
                onChange={(e) =>
                  setEditorType(e.target.value as "monaco" | "highlight")
                }
                className="bg-navy/50 text-white px-3 py-2 border border-gold/30 rounded-md"
              >
                <option value="monaco">Monaco Editor</option>
                <option value="highlight">Simple Editor</option>
              </select>

              {isOwner && (
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-green-500/20 text-green-500 px-4 py-2 rounded-md hover:bg-green-500/30 
                transition-colors flex items-center gap-2"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gold/20 text-gold px-4 py-2 rounded-md hover:bg-gold/30 
                    transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleEdit}
                        className="bg-gold/20 text-gold px-4 py-2 rounded-md hover:bg-gold/30 
                    transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-500/20 text-red-500 px-4 py-2 rounded-md hover:bg-red-500/30 
                    transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={handleCopy}
                className="bg-gold/20 text-gold px-4 py-2 rounded-md hover:bg-gold/30 
                transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tags Section */}
          <div className="flex flex-wrap gap-2 mb-6">
            {template.tags.split(",").map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gold/10 text-gold rounded-full text-sm border border-gold/20"
              >
                {tag.trim()}
              </span>
            ))}
          </div>

          {/* Explanation Section */}
          {isEditing ? (
            <textarea
              value={editFormData.explanation}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  explanation: e.target.value,
                })
              }
              className="w-full bg-navy/50 border border-gold/30 rounded-md px-3 py-2 text-white/80 mb-8"
              rows={4}
            />
          ) : (
            <p className="text-white/80 mb-8">{template.explanation}</p>
          )}
        </div>

        {/* Code Editor Section */}
        <div className="bg-navy/50 border border-gold/30 rounded-lg overflow-hidden">
          <div className="border-b border-gold/30 px-4 py-2 bg-navy/70">
            <span className="text-gold font-medium">{template.language}</span>
          </div>
          <div className="h-[600px]">
            <EditorWrapper
              value={isEditing ? editFormData.content || "" : template.content}
              onChange={(value) =>
                isEditing &&
                setEditFormData({ ...editFormData, content: value })
              }
              language={template.language}
              editorType={editorType}
              readOnly={!isEditing}
            />
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-navy border border-gold/30 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gold mb-4">
                Delete Template
              </h3>
              <p className="text-white/80 mb-6">
                Are you sure you want to delete this template? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-white/80 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
