// components/HighlightEditor.tsx
import { useState, useEffect } from "react";

interface HighlightEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
}

export const HighlightEditor = ({
  value,
  onChange,
  language,
  readOnly = false,
}: HighlightEditorProps) => {
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    const highlightCode = async () => {
      if (!value.trim()) {
        setHighlightedCode("");
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}/api/code_run/highlight`, {
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
        readOnly={readOnly}
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