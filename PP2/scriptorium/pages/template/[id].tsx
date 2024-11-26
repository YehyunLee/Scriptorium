import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Template } from "@/types/general";
import { EditorWrapper } from "@/components/EditorWrapper";
import { useAuth } from "@/utils/contexts/auth_context";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { TagInput } from "@/components/TagInput";
import Link from "next/link";

// Credit to Yehyun, worked with Github AutoComplete to improve the UI
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
  const [editMessage, setEditMessage] = useState<{
    text: string;
    type: "success" | "error" | null;
  }>({ text: "", type: null });
  const isAuthenticated = useAuth().isAuthenticated;

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
          // convert tags to array
          ...editFormData,
          tags: editFormData.tags?.split(","),
        }
      );

      if (response.ok) {
        const updatedTemplate = await response.json();
        setTemplate(updatedTemplate.template);
        setIsEditing(false);
        setEditMessage({
          text: "Template updated successfully",
          type: "success",
        });
        setTimeout(() => setEditMessage({ text: "", type: null }), 3000);
      }
    } catch (error) {
      console.error("Failed to update template:", error);
      setEditMessage({ text: "Failed to update template", type: "error" });
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

  const [showForkModal, setShowForkModal] = useState(false);
  const [forkData, setForkData] = useState<{
    title: string;
    explanation: string;
    content: string;
    tags: string[];
    language: string;
  }>({
    title: "",
    explanation: "",
    content: "",
    tags: [],
    language: "",
  });

  // Add fork handler
  const handleFork = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const response = await api.post(
        `/code_template/user/create_fork_template?id=${id}`,
        {
          ...forkData,
          tags: forkData.tags,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShowForkModal(false);
        router.push(`/template/${data.template.id}`);
      }
    } catch (error) {
      console.error("Failed to fork template:", error);
    }
  };

  // Add ForkModal component
  const ForkModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-navy border border-gold/30 rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-xl font-bold text-gold mb-4">Fork Template</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Title
            </label>
            <input
              type="text"
              value={forkData.title}
              onChange={(e) =>
                setForkData({ ...forkData, title: e.target.value })
              }
              className="w-full bg-navy/50 border border-gold/30 rounded-md px-3 py-2 text-white"
              placeholder="Enter new title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Tags
            </label>
            <TagInput
              tags={forkData.tags}
              onTagsChange={(newTags) =>
                setForkData({ ...forkData, tags: newTags })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Explanation
            </label>
            <textarea
              value={forkData.explanation}
              onChange={(e) =>
                setForkData({ ...forkData, explanation: e.target.value })
              }
              className="w-full bg-navy/50 border border-gold/30 rounded-md px-3 py-2 text-white"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => setShowForkModal(false)}
            className="px-4 py-2 text-white/80 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleFork}
            className="px-4 py-2 bg-gold text-navy rounded-md hover:bg-gold/90"
          >
            Fork Template
          </button>
        </div>
      </div>
    </div>
  );

  // Update header section to include edit/delete buttons for owners
  const isOwner = user?.id === template?.authorId;

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
        {editMessage.text && (
          <div
            className={`mb-4 p-3 rounded-md ${
              editMessage.type === "success"
                ? "bg-green-500/10 text-green-500 border border-green-500"
                : "bg-red-500/10 text-red-500 border border-red-500"
            }`}
          >
            {editMessage.text}
          </div>
        )}

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
                By {template.author?.firstName} {template.author?.lastName} •
                {new Date(template.createdAt).toLocaleDateString()}
              </p>
              {/* Add fork info here */}
              {template?.forkedFromId && (
                <div className="mt-2 flex items-center gap-2 text-white/60">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    />
                  </svg>
                  <span>
                    Forked from{" "}
                    <Link
                      href={`/template/${template.forkedFromId}`}
                      className="text-gold hover:underline inline-flex items-center gap-1"
                    >
                      {template.forkedFrom?.title}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </Link>
                  </span>
                </div>
              )}
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

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push("/login");
                    return;
                  }
                  setForkData({
                    title: `Fork of ${template.title}`,
                    explanation: template.explanation,
                    content: template.content,
                    tags: template.tags.split(",").map((t) => t.trim()),
                    language: template.language,
                  });
                  setShowForkModal(true);
                }}
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
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
                Fork
              </button>
            </div>

            {/* Add fork modal */}
            {showForkModal && <ForkModal />}
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Explanation Column */}
            <div>
              <label className="block text-sm font-medium text-gold mb-2">
                Explanation
              </label>
              {isEditing ? (
                <textarea
                  value={editFormData.explanation}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      explanation: e.target.value,
                    })
                  }
                  className="w-full bg-navy/50 border border-gold/30 rounded-md px-3 py-2 text-white/80"
                  rows={4}
                />
              ) : (
                <p className="text-white/80">{template.explanation}</p>
              )}
            </div>

            {/* Tags and Language Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gold mb-2">
                  Tags
                </label>
                {isEditing ? (
                  <TagInput
                    tags={
                      editFormData.tags?.split(",").map((t) => t.trim()) || []
                    }
                    onTagsChange={(newTags) =>
                      setEditFormData({
                        ...editFormData,
                        tags: newTags.join(", "),
                      })
                    }
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {template.tags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gold/10 text-gold rounded-full text-sm border border-gold/20"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">
                    Language
                  </label>
                  <select
                    value={editFormData.language}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        language: e.target.value,
                      })
                    }
                    className="bg-navy/50 text-white px-3 py-2 border border-gold/30 rounded-md w-full"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Editor Section */}
        <div className="bg-navy/50 border border-gold/30 rounded-lg overflow-hidden">
          <div className="border-b border-gold/30 px-4 py-2 bg-navy/70">
            <span className="text-gold font-medium">
              {isEditing ? editFormData.language : template.language}
            </span>
          </div>
          <div className="h-[600px]">
            <EditorWrapper
              value={isEditing ? editFormData.content || "" : template.content}
              onChange={(value) =>
                isEditing &&
                setEditFormData({ ...editFormData, content: value })
              }
              language={
                isEditing ? editFormData.language || "" : template.language
              }
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
