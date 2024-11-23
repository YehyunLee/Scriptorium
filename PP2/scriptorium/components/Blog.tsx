import React, { useState } from "react";

const Blog = ({ id, title, content, tags, codeTemplateIds, onCloseHandler } : { id: number, title: string, content: string, tags: string, codeTemplateIds: string, onCloseHandler:()=>void }) => {
    const [comments, setComments] = useState<string[]>([]);
    const [newComment, setNewComment] = useState<string>("");
  
    const handleAddComment = () => {
      if (newComment.trim() !== "") {
        setComments([...comments, newComment]);
        setNewComment("");
      }
    };
  
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


        <div className="mt-20">
          <h3 className="text-lg font-bold text-gold mb-2">Comments</h3>
          <ul className="space-y-2">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <li
                  key={index}
                  className="bg-navy/80 border border-gold/30 rounded-md p-2 text-gold"
                >
                  {comment}
                </li>
              ))
            ) : (
              <p className="text-gold/50">No comments yet. Be the first to comment!</p>
            )}
          </ul>
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-navy border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold"
            />
            <button
              onClick={handleAddComment}
              className="bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
