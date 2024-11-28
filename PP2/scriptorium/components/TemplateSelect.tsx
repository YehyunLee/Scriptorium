// components/TemplateSelect.tsx
import { useState, useEffect } from 'react';

interface Template {
  id: number;
  title: string;
}

interface TemplateSelectProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function TemplateSelect({ selectedIds, onChange }: TemplateSelectProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/code_template/list');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    if (selectedId === -1) {
      // If "None" is selected
      onChange([]);
    } else {
      // Add to existing selectedIds if not already included
      const newIds = selectedIds.includes(selectedId) 
        ? selectedIds 
        : [...selectedIds, selectedId];
      onChange(newIds);
    }
  };

  return (
    <div>
      <select
        value={selectedIds[selectedIds.length - 1] || -1}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white 
          focus:ring-gold focus:border-gold"
      >
        <option value={-1}>Select a template</option>
        {loading ? (
          <option disabled>Loading templates...</option>
        ) : (
          templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.title}
            </option>
          ))
        )}
      </select>
      {selectedIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedIds.map(id => {
            const template = templates.find(t => t.id === id);
            return template && (
              <div key={id} className="flex items-center gap-1 bg-gold/10 text-gold px-2 py-1 rounded-md">
                <span>{template.title}</span>
                <button
                  onClick={() => onChange(selectedIds.filter(i => i !== id))}
                  className="text-gold hover:text-white"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}