"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type CapsuleItem = {
  id: number;
  type: string;
  text_content: string | null;
  content_url: string | null;
  is_public: boolean;
};

type Profile = {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  instagram_url: string | null;
};

export default function PublicCapsulePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<CapsuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCapsule = async () => {
      setLoading(true);

      // 1️⃣ Fetch profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url, instagram_url")
        .eq("username", username)
        .single();

      if (error || !profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // 2️⃣ Fetch capsule
      const { data: capsule } = await supabase
        .from("capsules")
        .select("id")
        .eq("user_id", profileData.id)
        .single();

      if (!capsule) {
        setItems([]);
        setLoading(false);
        return;
      }

      // 3️⃣ Fetch public items
      const { data: publicItems } = await supabase
        .from("capsule_items")
        .select("*")
        .eq("capsule_id", capsule.id)
        .eq("is_public", true);

      setItems(publicItems || []);
      setLoading(false);
    };

    loadCapsule();
  }, [username]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Capsule not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 max-w-3xl mx-auto">
      
      {/* 🔥 PROFILE HEADER */}
      <div className="flex items-center gap-6 mb-12">

        {/* Clickable Avatar */}
        {profile.avatar_url ? (
          <a
            href={profile.instagram_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border border-gray-700 shadow-lg hover:scale-105 transition"
            />
          </a>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-3xl font-bold">
            {profile.display_name?.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold">
            {profile.display_name}
          </h1>

          <p className="text-gray-400">
            @{profile.username}
          </p>

          {profile.instagram_url && (
            <a
              href={profile.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline text-sm mt-1 block"
            >
              Visit Instagram
            </a>
          )}
        </div>
      </div>

      {/* 🔥 CAPSULE ITEMS */}
      {items.length === 0 ? (
        <p className="text-gray-400">No public items.</p>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 p-6 rounded-xl border border-gray-800"
            >
              {item.type === "text" && (
                <p>{item.text_content}</p>
              )}

              {item.type !== "text" && item.content_url && (
                <a
                  href={item.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300 transition"
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
