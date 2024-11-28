import { useState, useEffect } from "react";
import { useAuth } from "../utils/contexts/auth_context";
import { useRouter } from "next/router";
import { UserProfile } from "@/types/auth";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [isAuthenticated]);

  // usually when useEffect takes paramter?:
  // A. the function is called when the component mounts
  // B. the function is called when the component updates
  // C. the function is called when the component unmounts
  // D. the function is called when the value of the parameter changes

  // mounts means the component is rendered for the first time
  // unmounts means the component is removed from the DOM

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + "/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + "/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setIsEditing(false);
      await fetchProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg text-navy dark:text-gold flex items-center justify-center">
        <div className="text-gold">Loading...</div>
      </div>
    );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-navy dark:text-gold py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy/50 border border-gold/30 rounded-lg shadow-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gold">Profile</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm bg-gold text-navy rounded-md hover:bg-gold/90 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gold mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gold mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phoneNumber || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white disabled:opacity-50"
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gold mb-1">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      onChange={(e) =>
                        setProfile({ ...profile, password: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-navy border border-gold/30 rounded-md text-white"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gold text-navy rounded-md hover:bg-gold/90 transition"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
