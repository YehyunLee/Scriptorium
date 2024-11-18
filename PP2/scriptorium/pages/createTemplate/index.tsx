import { useState } from "react";

export default function CreateTemplate() {
  const [formData, setFormData] = useState({
    title: "",
    explanation: "",
    tags: "",
    content: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="">
      <div className="">
        <h2 className="">Create a Code Template</h2>
        <form onSubmit={handleSubmit}>

          <div className="">
            <label htmlFor="title" className="">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter title"
              required
              className=""
            />
          </div>
          
          <div className="">
            <label htmlFor="explanation" className="">
              Explanation
            </label>
            <textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleInputChange}
              placeholder="Explain your template"
              rows={4}
              required
              className=""
            />
          </div>
          
          <div className="">
            <label htmlFor="tags" className="">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., JavaScript, Python, C"
              className=""
            />
          </div>
          
          <div className="">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content (optional)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your code here"
              rows={6}
              className=""
            />
          </div>
          
          <div className="">
            <button
              type="submit"
              className=""
            >
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
