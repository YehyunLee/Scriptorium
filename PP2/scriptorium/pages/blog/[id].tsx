import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/utils/contexts/auth_context";


// This is just based on Rosalie's search, blog code, rebuilt with Copilot and myself (Yehyun)
// All credit to Rosalie!
export default function BlogPage() {
    const router = useRouter();
    const { id } = router.query;
    const { user, isAuthenticated } = useAuth();

    const [blog, setBlog] = useState<any>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [blogVotes, setBlogVotes] = useState<number>(0);
    const [blogRating, setBlogRating] = useState<number>(0);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [commentsPage, setCommentsPage] = useState<number>(1);
    const [commentsLimit] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserCommentRatings, setCurrentUserCommentRatings] = useState<any>({});

    useEffect(() => {
        setAuthToken(localStorage.getItem("accessToken"));
        if (id) {
            fetchBlogData();
            loadBlogRating();
            loadComments();
        }
    }, [id]);

    const fetchBlogData = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}/api/blog/${id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setBlog(data);
            } else {
                setError("Failed to fetch blog");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Reuse functions from Blog component
    const loadBlogRating = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}/api/blog/${id}/get_rates`,
                {
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
                    let currentUserRating = data.usersWhoRatedIds.find(
                        (userRatingPair: any) => userRatingPair.hasOwnProperty(user.id)
                    );
                    if (currentUserRating && currentUserRating[user.id] !== 0) {
                        setBlogRating(currentUserRating[user.id]);
                    }
                }
            }
        } catch (err) {
            console.log("error getting blog rates");
        }
    };




    const getCommentRating = async (commentId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` +
                `/api/comments/${commentId}/get_rates`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();

                let currentUserRating = data.usersWhoRatedIds.find(
                    (userRatingPair: any) => userRatingPair.hasOwnProperty(5)
                );

                if (currentUserRating) {
                    if (user) {
                        if (currentUserRating[user.id] !== 0) {
                            let newCommentRatings = currentUserCommentRatings;
                            newCommentRatings[commentId] = currentUserRating[user.id];
                            setCurrentUserCommentRatings(newCommentRatings);
                        }
                    }
                }

                return data.averageRate;
            } else {
                console.log("error getting comment rating");
                return 0;
            }
        } catch (err: any) {
            console.log("error getting comment rating");
            return 0;
        }
    };



    const loadComments = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}/api/blog/${id}/get_comments?page=${commentsPage}&limit=${commentsLimit}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            const data = await response.json();

            const commentsWithRatings = await Promise.all(
                (data.comments || []).map(async (comment: any) => {
                    const averageCommentRate = await getCommentRating(comment.id);
                    return {
                        ...comment,
                        averageRate: averageCommentRate
                    };
                })
            );

            setComments(commentsWithRatings);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        }
    };



    const handleVote = async (index: number, change: number, isBlog: boolean) => {
        let actualChange = change;
        let currentCommentRating = 0;
        let newCommentRatings = currentUserCommentRatings;

        if (isBlog) {
            currentCommentRating = blogRating;
        } else {
            let commentId = comments[index].id;

            //if this comment hasnt been rated, set it to no rating (0)
            if (!newCommentRatings[commentId]) {
                newCommentRatings[commentId] = 0;
            }

            currentCommentRating = newCommentRatings[commentId];
        }

        //if clicking arrow second time, remove rating
        if (
            (currentCommentRating == 1 && change == 1) ||
            (currentCommentRating == -1 && change == -1)
        ) {
            actualChange = 0;
        }

        let netChange = actualChange == 0 ? -change : change;

        //edge cases when clicking opposite arrow of selected arrow
        if (currentCommentRating == 1 && change == -1) {
            netChange = -2;
        } else if (currentCommentRating == -1 && change == 1) {
            netChange = 2;
        }

        if (isBlog) {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` +
                    `/api/blog/${id}/add_rate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ ratingValue: actualChange }),
                    }
                );

                if (response.ok) {
                    setBlogVotes(blogVotes + netChange);
                    setBlogRating(actualChange);
                } else {
                    console.error("Failed to rate the comment:", await response.json());
                }
            } catch (error) {
                console.error("Error while rating the comment:", error);
                return false;
            }
        } else {
            const updatedComments = [...comments];
            let commentId = updatedComments[index].id;

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` +
                    `/api/comments/${commentId}/add_rate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ ratingValue: actualChange }),
                    }
                );

                if (response.ok) {
                    updatedComments[index].averageRate += netChange;
                    setComments(updatedComments);
                    newCommentRatings[commentId] = actualChange;
                    setCurrentUserCommentRatings(newCommentRatings);
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

    if (loading) return <div className="min-h-screen bg-navy p-12 text-gold">Loading...</div>;
    if (error) return <div className="min-h-screen bg-navy p-12 text-red-500">{error}</div>;
    if (!blog) return <div className="min-h-screen bg-navy p-12 text-gold">Blog not found</div>;

    return (
        <div className="min-h-screen bg-navy p-12">
            <div className="max-w-6xl mx-auto">
                <div className="bg-navy/50 border border-gold/30 rounded-lg shadow-lg p-8">

                    <div className="flex justify-between items-center mb-6">
                        <div className="space-x-4">
                            <Link
                                href="/blog/search"
                                className="text-gold hover:text-gold/80 inline-block px-4 py-2 border border-gold/30 rounded-md"
                            >
                                ← Back to Search
                            </Link>
                            <Link
                                href="/blog/profile"
                                className="text-gold hover:text-gold/80 inline-block px-4 py-2 border border-gold/30 rounded-md"
                            >
                                My Blog →
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-start space-x-6">
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => handleVote(0, 1, true)}
                                className={blogRating == 1 ? "text-gold" : "text-white"}
                            >
                                ▲
                            </button>
                            <span className="text-gold">{blogVotes || 0}</span>
                            <button
                                onClick={() => handleVote(0, -1, true)}
                                className={blogRating == -1 ? "text-gold" : "text-white"}
                            >
                                ▼
                            </button>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gold mb-4">{blog.title}</h1>
                            <p className="text-gold/90 text-lg mb-6">{blog.content}</p>

                            <div className="text-sm text-gold/50">
                                <p className="mb-2">
                                    <span className="font-bold">Tags:</span> {blog.tags || "None"}
                                </p>
                                <p>
                                    <span className="font-bold">Templates:</span>{" "}
                                    {blog.codeTemplates?.length > 0 ? (
                                        <div className="inline-flex gap-2">
                                            {blog.codeTemplates.map((template: any) => (
                                                <Link
                                                    key={template.id}
                                                    href={`/template/${template.id}`}
                                                    className="text-gold hover:underline"
                                                >
                                                    {template.title}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        "None"
                                    )}
                                </p>
                            </div>

                            {user && blog.authorId === user.id && (
                                <div className="mt-8">
                                    <button
                                        onClick={() => router.push(`/blog/edit?blogId=${id}`)}
                                        className="bg-gold text-navy py-2 px-6 rounded-md hover:bg-gold/90 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => router.push(`/blog/delete?blogId=${id}`)}
                                        className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-500"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gold mb-6">Comments</h2>
                        {/* Comments section */}
                        <div className="mt-8 space-y-4">
                            {/* Add comment input */}
                            {isAuthenticated && (
                                <div className="flex items-center space-x-2 mb-6">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 px-3 py-2 bg-navy border border-gold/30 rounded-md text-white focus:ring-gold focus:border-gold"
                                    />
                                    <button
                                        onClick={async () => {
                                            if (!newComment.trim()) return;
                                            try {
                                                const response = await fetch(
                                                    `${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}/api/blog/${id}/add_comment`,
                                                    {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                            Authorization: `Bearer ${authToken}`,
                                                        },
                                                        body: JSON.stringify({
                                                            content: newComment,
                                                            parentCommentId: null,
                                                        }),
                                                    }
                                                );

                                                if (response.ok) {
                                                    setNewComment("");
                                                    await loadComments();
                                                }
                                            } catch (err) {
                                                console.error("Error adding comment:", err);
                                            }
                                        }}
                                        className="bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                                    >
                                        Add Comment
                                    </button>
                                </div>
                            )}

                            {/* Comments list */}
                            {comments.length > 0 ? (
                                <ul className="space-y-4">
                                    {comments.map((comment, index) => (
                                        <li
                                            key={comment.id}
                                            className="bg-navy/80 border border-gold/30 rounded-md p-4 flex items-start space-x-4"
                                        >
                                            <div className="flex flex-col items-center">
                                                <button
                                                    onClick={() => handleVote(index, 1, false)}
                                                    className={`${currentUserCommentRatings[comment.id] === 1
                                                        ? "text-gold"
                                                        : "text-white"
                                                        } hover:text-gold/80`}
                                                >
                                                    ▲
                                                </button>
                                                <span className="text-gold">{comment.averageRate || 0}</span>
                                                <button
                                                    onClick={() => handleVote(index, -1, false)}
                                                    className={`${currentUserCommentRatings[comment.id] === -1
                                                        ? "text-gold"
                                                        : "text-white"
                                                        } hover:text-gold/80`}
                                                >
                                                    ▼
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gold/90">{comment.content}</p>
                                                <p className="text-gold/50 text-sm mt-1">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gold/50">No comments yet. Be the first to comment!</p>
                            )}

                            {/* Pagination */}
                            {comments.length > 0 && (
                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => setCommentsPage(Math.max(1, commentsPage - 1))}
                                        disabled={commentsPage === 1}
                                        className={`bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 ${commentsPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCommentsPage(commentsPage + 1)}
                                        disabled={comments.length < commentsLimit}
                                        className={`bg-gold text-navy py-2 px-4 rounded-md hover:bg-gold/90 ${comments.length < commentsLimit ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}