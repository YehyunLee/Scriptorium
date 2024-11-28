import MonacoEditor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { TagInput } from "../../components/TagInput";
import "highlight.js/styles/vs2015.css";

import { EditorWrapper } from "@/components/EditorWrapper";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { CodeRunner } from "@/components/CodeRunner";


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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` +
          "/api/code_template/user/create_template",
        {
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
        }
      );

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
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-navy dark:text-gold">
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

            <div>
              <label className="block text-sm font-medium text-gold mb-1">
                Test Run
              </label>
              <CodeRunner code={formData.content} language={language} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
