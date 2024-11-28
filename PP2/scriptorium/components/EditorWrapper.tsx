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
          readOnly,
        }}
      />
    );
  }

  return (
    <HighlightEditor 
      value={value} 
      onChange={onChange} 
      language={language}
      readOnly={readOnly}
    />
  );
};