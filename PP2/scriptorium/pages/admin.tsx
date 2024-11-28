import { useState, useEffect } from "react";
import {useAuth} from "@/utils/contexts/auth_context";
import { useRouter } from "next/router"; // Import useRouter

export default function AdminPage() {
    const [reportedContent, setReportedContent] = useState({
        blogPosts: [],
        comments: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { isAuthenticated, user, logout } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false); // Track if user is an admin
    const router = useRouter(); // Initialize useRouter

    const fetchReportedContent = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}/api/admin/get_sorted_reports`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch reported content");
            const data = await res.json();
            setReportedContent(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleHideContent = async (contentType, contentId) => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}/api/admin/hide_content`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ contentType, contentId }),
            });
            if (!res.ok) throw new Error("Failed to hide content");
            alert("Content hidden successfully");
            fetchReportedContent(); // Refresh the data
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const fetchAdminStatus = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + "/api/admin/isAdmin", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                console.log(data)
                setIsAdmin(data.isAdmin);
                if (!data.isAdmin) {
                    router.push('/'); // Redirect if not admin
                }
            } catch (error) {
                console.error("Error fetching admin status:", error);
                router.push('/'); // Redirect in case of error
            }
        };

        if (isAuthenticated) {
            fetchAdminStatus();
        } else {
            router.push('/'); // Redirect if not authenticated
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        fetchReportedContent();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="min-h-screen bg-lightBg dark:bg-darkBg text-navy dark:text-gold py-12">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl text-gold mb-6">Reported Content</h1>

                <div className="space-y-8">
                    {["blogPosts", "comments"].map((type) => (
                        <div key={type}>
                            <h2 className="text-2xl text-gold capitalize">{type}</h2>
                            <table className="w-full table-auto border-collapse border border-gold">
                                <thead>
                                <tr>
                                    <th className="border border-gold px-4 py-2">ID</th>
                                    <th className="border border-gold px-4 py-2">Content</th>
                                    <th className="border border-gold px-4 py-2">Reports</th>
                                    <th className="border border-gold px-4 py-2">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportedContent[type].map((item) => (
                                    <tr key={item.id}>
                                        <td className="border border-gold px-4 py-2">{item.id}</td>
                                        <td className="border border-gold px-4 py-2">
                                            {item.content || item.body || "Content unavailable"}
                                        </td>
                                        <td className="border border-gold px-4 py-2">{item.reports.length}</td>
                                        <td className="border border-gold px-4 py-2">
                                            <button
                                                onClick={() => handleHideContent(type.slice(0, -1), item.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded"
                                            >
                                                Hide
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}