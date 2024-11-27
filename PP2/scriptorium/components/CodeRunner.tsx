import { useState, useEffect, useRef } from 'react';

// This file has been created with Github Copilot Sonnet with some modifications
interface CodeRunnerProps {
  code: string;
  language: string;
}

export const CodeRunner = ({ code, language }: CodeRunnerProps) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const runCode = async () => {
    setRunning(true);
    setError(null);
    setOutput('');

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const response = await fetch('/api/code_run/execute_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.error) {
                setError(data.error);
              } else if (data.output) {
                setOutput(prev => prev + data.output);
              }
            } catch (e) {
              console.error('Failed to parse line:', line);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gold mb-1">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 bg-navy/50 border border-gold/30 rounded-md text-white"
          placeholder="Enter test input (optional)"
          rows={3}
        />
      </div>

      <button
        onClick={runCode}
        disabled={running}
        className="w-full bg-gold text-navy px-4 py-2 rounded-md hover:bg-gold/90 
          disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {running ? (
          <>
            <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
            Running...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Code
          </>
        )}
      </button>

      {output && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gold">Output</label>
          <pre className="w-full px-3 py-2 bg-navy/50 border border-gold/30 rounded-md text-white overflow-auto whitespace-pre-wrap font-mono">
            {output}
          </pre>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-md text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};