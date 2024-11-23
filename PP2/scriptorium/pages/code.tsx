import MonacoEditor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { TagInput } from "../components/TagInput";
import "highlight.js/styles/vs2015.css";

const SUPPORTED_LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "c", name: "C" },
];

const HighlightEditor = ({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (value: string) => void;
  language: string;
}) => {
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    const highlightCode = async () => {
      if (!value.trim()) {
        setHighlightedCode("");
        return;
      }

      try {
        const response = await fetch("/api/code_run/highlight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: value, language }),
        });

        if (response.ok) {
          const data = await response.json();
          setHighlightedCode(data.highlightedCode);
        }
      } catch (error) {
        console.error("Highlighting failed:", error);
      }
    };

    highlightCode();
  }, [value, language]);

  return (
    <div className="relative w-full h-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute top-0 left-0 w-full h-full bg-transparent text-transparent caret-white p-4 font-mono resize-none z-10"
        spellCheck="false"
      />
      <pre className="absolute top-0 left-0 w-full h-full p-4 font-mono overflow-auto pointer-events-none">
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode || value }}
        />
      </pre>
    </div>
  );
};

const EditorWrapper = ({
  value,
  onChange,
  language,
  editorType,
}: {
  value: string;
  onChange: (value: string) => void;
  language: string;
  editorType: "monaco" | "highlight";
}) => {
  if (editorType === "monaco") {
    return (
      <MonacoEditor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
        }}
      />
    );
  }

  return (
    <HighlightEditor value={value} onChange={onChange} language={language} />
  );
};

export default function CreateTemplate() {
  const [tags, setTags] = useState<string[]>([]);
  const [language, setLanguage] = useState("javascript");
  const [editorType, setEditorType] = useState<"monaco" | "highlight">(
    "monaco"
  ); // 'monaco' or 'highlight'
  const [formData, setFormData] = useState({
    title: "",
    explanation: "",
    content: "",
  });
  const [responseMessage, setResponseMessage] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
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
          tags,
          language,
        }),
      });

      if (response.ok) {
        setResponseMessage({
          message: "Template created successfully",
          type: "success",
        });
      } else {
        setResponseMessage({
          message: "Failed to create template",
          type: "error",
        });
      }
    } catch (error) {
      setResponseMessage({
        message: "Failed to create template",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      <div className="bg-navy/80 border-b border-gold/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Template Title"
              className="bg-navy/50 text-white px-3 py-2 border border-gold/30 rounded-md w-64"
            />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-navy/50 text-white px-3 py-2 border border-gold/30 rounded-md"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
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
          </div>
          <button
            onClick={handleSubmit}
            className="bg-gold text-navy px-4 py-2 rounded-md hover:bg-gold/90"
          >
            Save Template
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        <div className="flex-1 h-full bg-navy/50">
          <EditorWrapper
            value={formData.content}
            onChange={(newValue) =>
              setFormData((prev) => ({ ...prev, content: newValue }))
            }
            language={language}
            editorType={editorType}
          />
        </div>

        <div className="w-80 border-l border-gold/30 bg-navy/50 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gold mb-1">
                Tags
              </label>
              <TagInput tags={tags} onTagsChange={setTags} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold mb-1">
                Explanation
              </label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 bg-navy/50 border border-gold/30 rounded-md text-white"
                placeholder="Explain your template"
              />
            </div>

            {responseMessage.message && (
              <div
                className={`p-3 rounded ${
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
    </div>
  );
}
