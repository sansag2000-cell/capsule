"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      console.log("Logged user:", user);

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, name, avatar_url")
        .eq("id", user.id)
        .single();

      console.log("Profile data:", data);
      console.log("Profile error:", error);

      if (data) {
        setName(data.display_name || data.name);
        setAvatar(data.avatar_url);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black text-white">
      <h1 className="text-lg font-semibold">Capsule</h1>

      <div className="flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        )}

        {name && <span>Hello, {name} 👋</span>}

        <button
          onClick={handleLogout}
          className="bg-white text-black px-4 py-1 rounded-full text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
