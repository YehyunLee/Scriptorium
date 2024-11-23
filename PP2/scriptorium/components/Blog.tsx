import React from "react";

const Blog = ({ id, title, content, tags, codeTemplateIds, onCloseHandler } : { id: number, title: string, content: string, tags: string, codeTemplateIds: string, onCloseHandler:()=>void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-navy border border-gold/30 rounded-lg shadow-lg pt-2 pb-6 pl-6 pr-2 max-w-3xl w-full">
        <div className="w-full flex justify-end">
            <button
                onClick={onCloseHandler}
                className="w-8 h-8 text-gold rounded-md text-2xl hover:text-gold/80 focus:outline-none"
            >
                &times;
            </button>
        </div>
        <h2 className="text-2xl font-bold text-gold">{title}</h2>
        <p className="text-gold/90 mt-2">{content}</p>
        <div className="mt-4 text-sm text-gold/50">
          <p>
            <span className="font-bold">Tags:</span> {tags || "None"}
          </p>
          <p>
            <span className="font-bold">Templates:</span>{" "}
            {codeTemplateIds || "None"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Blog;
