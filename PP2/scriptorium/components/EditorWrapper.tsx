import MonacoEditor from "@monaco-editor/react";
import { HighlightEditor } from "./HighlightEditor";
import "highlight.js/styles/vs2015.css";

interface EditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  editorType: "monaco" | "highlight";
  readOnly?: boolean;
}

export const EditorWrapper = ({
  value,
  onChange,
  language,
  editorType,
  readOnly = false,
}: EditorWrapperProps) => {
  if (editorType === "monaco") {
    return (
      <div className="h-full w-full overflow-hidden">
      <MonacoEditor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        theme="vs-dark"
        options={{
            fontSize: window.innerWidth < 640 ? 12 : 14,
            minimap: { 
              enabled: window.innerWidth >= 640 
            },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
          readOnly,
            padding: {
              top: window.innerWidth < 640 ? 8 : 16,
              bottom: window.innerWidth < 640 ? 8 : 16
            },
            folding: window.innerWidth >= 640,
            lineNumbers: window.innerWidth >= 640 ? 'on' : 'off',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: window.innerWidth < 640 ? 8 : 14,
              horizontalScrollbarSize: window.innerWidth < 640 ? 8 : 14
            }
        }}
      />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden">
    <HighlightEditor 
      value={value} 
      onChange={onChange} 
      language={language}
      readOnly={readOnly}
    />
    </div>
  );
};