import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Template } from "@/types/general";
import { EditorWrapper } from "@/components/EditorWrapper";

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
              <h1 className="text-3xl font-bold text-gold mb-2">
                {template.title}
              </h1>
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

          <p className="text-white/80 mb-8">{template.explanation}</p>
        </div>

        <div className="bg-navy/50 border border-gold/30 rounded-lg overflow-hidden">
          <div className="border-b border-gold/30 px-4 py-2 bg-navy/70 flex justify-between items-center">
            <span className="text-gold font-medium">{template.language}</span>
          </div>
          <div className="h-[600px]">
            <EditorWrapper
              value={template.content}
              onChange={() => {}}
              language={template.language}
              editorType={editorType}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
