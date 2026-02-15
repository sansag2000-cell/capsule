"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type CapsuleItem = {
  id: number;
  type: string;
  text_content: string | null;
  content_url: string | null;
  is_public: boolean;
  file_size_mb: number | null;
};

type Capsule = {
  id: number;
  unlock_date: string;
  capsule_items: CapsuleItem[];
};

export default function Dashboard() {
  const router = useRouter();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [instagram, setInstagram] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      // 🔥 Load Instagram
      const { data: profileData } = await supabase
        .from("profiles")
        .select("instagram_url")
        .eq("id", session.user.id)
        .single();

      if (profileData?.instagram_url) {
        setInstagram(profileData.instagram_url);
      }

      // 🔥 Load Capsule
      const { data, error } = await supabase
        .from("capsules")
        .select(`
          id,
          unlock_date,
          capsule_items (
            id,
            type,
            text_content,
            content_url,
            is_public,
            file_size_mb
          )
        `)
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(error);
      }

      setCapsule(data || null);
      setLoading(false);
    };

    loadData();
  }, [router]);

  // 🔥 Avatar Upload
  const uploadAvatar = async () => {
    if (!avatarFile) {
      alert("Select an image first.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { upsert: true });

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Avatar updated!");
  };

  // 🔥 Save Instagram
  const saveInstagram = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ instagram_url: instagram })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Instagram updated!");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        Loading...
      </main>
    );
  }

  if (!capsule) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-4xl font-bold mb-6">Your Capsule</h1>
        <p>No capsule created yet.</p>
      </main>
    );
  }

  const unlockDate = new Date(capsule.unlock_date);
  const now = new Date();
  const isLocked = unlockDate > now;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Your Capsule</h1>

      {/* Avatar Upload */}
      <div className="mb-8 bg-gray-900 p-6 rounded-lg">
        <p className="text-sm text-gray-400 mb-2">
          Set Profile Picture
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setAvatarFile(e.target.files[0]);
            }
          }}
          className="mb-4"
        />

        <button
          onClick={uploadAvatar}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Upload Avatar
        </button>
      </div>

      {/* Instagram Section */}
      <div className="mb-8 bg-gray-900 p-6 rounded-lg">
        <p className="text-sm text-gray-400 mb-2">
          Instagram Profile (Optional)
        </p>

        <input
          type="text"
          placeholder="https://instagram.com/yourhandle"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          className="p-2 text-white bg-gray-800 rounded w-full mb-4"
        />

        <button
          onClick={saveInstagram}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Save Instagram
        </button>
      </div>

      {isLocked && (
        <div className="mb-6 p-4 bg-gray-900 rounded">
          🔒 Locked until {unlockDate.toLocaleDateString()}
        </div>
      )}

      {capsule.capsule_items.length === 0 ? (
        <p>No items inside capsule yet.</p>
      ) : (
        <div className="space-y-4">
          {capsule.capsule_items.map((item) => (
            <div key={item.id} className="bg-gray-900 p-6 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">
                {item.is_public ? "Public" : "Private"}
              </p>

              {item.type === "text" && (
                <p>{item.text_content}</p>
              )}

              {item.type !== "text" && item.content_url && (
                <a
                  href={item.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  View {item.type}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
