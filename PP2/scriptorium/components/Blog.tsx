import { useAuth } from "@/utils/contexts/auth_context";
import React, { useEffect, useState } from "react";

const Blog = ({ id, title, content, tags, codeTemplates, onCloseHandler } : { id: number, title: string, content: string, tags: string, codeTemplates: string, onCloseHandler:()=>void }) => {
    const { user, isAuthenticated } = useAuth();
    
    const [authToken, setAuthToken] = useState<string | null>(null)
    const [blogVotes, setBlogVotes] = useState<number>(0);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [commentsPage, setCommentsPage] = useState<number>(1);
    const [commentsLimit] = useState<number>(10);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    const [blogRating, setBlogRating] = useState<number>(0);
    const [currentUserCommentRatings, setCurrentUserCommentRatings] = useState<any>({});

    useEffect(() => {
        setAuthToken(localStorage.getItem("accessToken"))
        loadBlogRating()
        loadComments()
    }, []);

    const loadBlogRating = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + `/api/blog/${id}/get_rates`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
    
            if (response.ok) {
                const data = await response.json();
                setBlogVotes(data.averageRate || 0);

                if (user) {
                    let currentUserRating = data.usersWhoRatedIds.find((userRatingPair: any) => userRatingPair.hasOwnProperty(user.id))

                    if (currentUserRating) {
                        if (currentUserRating[user.id] !== 0) {
                            setBlogRating(currentUserRating[user.id])
                        }
                    }
                }
            }
        } catch (err: any) {
            console.log("error getting blog rates")
        } finally {
            setLoadingComments(false);
        }
    }

    const loadComments = async () => {
        setLoadingComments(true);
        setCommentsError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + `/api/blog/${id}/get_comments?page=${commentsPage}&limit=${commentsLimit}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
    
            if (response.ok) {
                const data = await response.json();

                let comments = []
                if (data.comments && data.comments.length > 0) {
                    for (const comment of data.comments) {
                        let averageCommentRate = await getCommentRating(comment.id)
                        let newComment = comment
                        newComment.averageRate = averageCommentRate
                        comments.push(newComment)
                    }
                }
                setComments(comments || []);
            } else {
                const errorData = await response.json();
                setCommentsError(errorData.message || "Failed to fetch blogs");
            }
        } catch (err: any) {
            setCommentsError(err.message || "An unexpected error occurred");
        } 
    }

    const getCommentRating = async (commentId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + `/api/comments/${commentId}/get_rates`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
    
            if (response.ok) {
                const data = await response.json();

                let currentUserRating = data.usersWhoRatedIds.find((userRatingPair: any) => userRatingPair.hasOwnProperty(5))

                if (currentUserRating) {
                    if (user) {
                        if (currentUserRating[user.id] !== 0) {
                            let newCommentRatings = currentUserCommentRatings
                            newCommentRatings[commentId] = currentUserRating[user.id]
                            setCurrentUserCommentRatings(newCommentRatings)
                        }
                    }
                }

                return data.averageRate
            } else {
                console.log("error getting comment rating")
                return 0
            }
        } catch (err: any) {
            console.log("error getting comment rating")
            return 0
        } 
    }

    const handleAddComment = async () => {
      if (newComment.trim() !== "") {
        if (isAuthenticated) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + `/api/blog/${id}/add_comment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify({content: newComment, parentCommentId: null}),
                });
    
                if (response.ok) {
                    setComments([...comments, { id: comments.length, text: newComment, votes: 0 }]);
                    setNewComment("");
                } else {
                    setCommentsError("Error adding comment")
                }
            } catch (err: any) {
                setCommentsError(`Error: ${err.message}`);
            }
        } else {
            alert("You must be logged in to post a comment")
        }
      }
    };

    const handleVote = async (index: number, change: number, isBlog: boolean) => {

        let actualChange = change
        let currentCommentRating = 0
        let newCommentRatings = currentUserCommentRatings

        if (isBlog) {
            currentCommentRating = blogRating
        } else {
            let commentId = comments[index].id
            
            //if this comment hasnt been rated, set it to no rating (0)
            if (!newCommentRatings[commentId]) {
                newCommentRatings[commentId] = 0
            }

            currentCommentRating = newCommentRatings[commentId]
        }

        //if clicking arrow second time, remove rating
        if ((currentCommentRating == 1 && change == 1) || (currentCommentRating == -1 && change == -1)) {
            actualChange = 0
        }

        let netChange = (actualChange == 0 ? -change: change)

        //edge cases when clicking opposite arrow of selected arrow
        if (currentCommentRating == 1 && change == -1) {
            netChange = -2
        } else if (currentCommentRating == -1 && change == 1) {
            netChange = 2
        }

        if (isBlog) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + `/api/blog/${id}/add_rate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ ratingValue: actualChange }),
                });
            
                if (response.ok) {
                    setBlogVotes(blogVotes + netChange);
                    setBlogRating(actualChange)
                } else {
                    console.error("Failed to rate the comment:", await response.json());
                }
            } catch (error) {
                console.error("Error while rating the comment:", error);
                return false;
            }
        } else {
            const updatedComments = [...comments];
            let commentId = updatedComments[index].id

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + `/api/comments/${commentId}/add_rate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ ratingValue: actualChange }),
                });
            
                if (response.ok) {
                    updatedComments[index].averageRate += netChange;
                    setComments(updatedComments);
                    newCommentRatings[commentId] = actualChange
                    setCurrentUserCommentRatings(newCommentRatings)
                } else {
                    console.error("Failed to rate the comment:", await response.json());
                    return false;
                }
            } catch (error) {
                console.error("Error while rating the comment:", error);
                return false;
            }
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

                <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => handleVote(0, 1, true)}
                            className={((blogRating == 1) ? "text-gold hover:text-gold/80" : "text-white hover:opacity-80") + " text-xl hover:text-gold/80 focus:outline-none"}
                        >
                            ▲
                        </button>
                        <span className="text-gold">{blogVotes || 0}</span>
                        <button
                            onClick={() => handleVote(0, -1, true)}
                            className={((blogRating == -1) ? "text-gold hover:text-gold/80" : "text-white hover:opacity-80") + " text-xl hover:text-gold/80 focus:outline-none"}
                        >
                            ▼
                        </button>
                    </div>
                <div>
                    <h2 className="text-2xl font-bold text-gold">{title}</h2>
                    <p className="text-gold/90 mt-2">{content}</p>
                    <div className="mt-4 text-sm text-gold/50">
                        <p>
                            <span className="font-bold">Tags:</span> {tags || "None"}
                        </p>
                        <p>
                            <span className="font-bold">Templates:</span>{" "}
                            {codeTemplates || "None"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-20">
                <h3 className="text-lg font-bold text-gold mb-2">Comments</h3>
                <ul className="space-y-2">
                    {comments.length > 0 ? (
                        comments.map((comment, index) => (
                            <li
                                key={index}
                                className="bg-navy/80 border border-gold/30 rounded-md p-2 text-gold flex items-center space-x-4"
                            >
                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleVote(index, 1, false)}
                                        className={((currentUserCommentRatings[comment.id] && currentUserCommentRatings[comment.id] == 1) ? "text-gold hover:text-gold/80" : "text-white hover:opacity-80") + " text-xl hover:text-gold/80 focus:outline-none"}
                                    >
                                        ▲
                                    </button>
                                    <span className="text-gold">{comment.averageRate || 0}</span>
                                    <button
                                        onClick={() => handleVote(index, -1, false)}
                                        className={((currentUserCommentRatings[comment.id] && currentUserCommentRatings[comment.id] == -1) ? "text-gold hover:text-gold/80" : "text-white hover:opacity-80") + " text-xl hover:text-gold/80 focus:outline-none"}
                                    >
                                        ▼
                                    </button>
                                </div>
                                <p>{comment.content}</p>
                            </li>
                        ))
                    ) : (
                        (loadingComments) ? <p className="text-gold/50">Loading comments...</p> 
                        : (commentsError) ? <p className="text-gold/50">There was an error loading comments.</p>
                        : <p className="text-gold/50">No comments yet. Be the first to comment!</p>
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
