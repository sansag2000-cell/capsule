"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Navbar() {
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUser(null);
        return;
      }

      setUser(user);

      const { data } = await supabase
        .from("profiles")
        .select("display_name, name, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.display_name || data.name);
        setAvatar(data.avatar_url);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="relative flex justify-between items-center px-6 py-6 bg-black text-white border-b border-gray-800">

      {/* Left: Brand */}
      <Link href="/" className="text-xl font-semibold tracking-wide">
        Capsule
      </Link>

      {/* Center: Emotional Line (NOT clickable) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-sm opacity-60 tracking-wide pointer-events-none">
        For when the time is right.
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {user ? (
          <>
            {avatar && (
              <img
                src={avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}

            {name && <span className="text-sm">Hello, {name} 👋</span>}

            <button
              onClick={handleLogout}
              className="text-sm opacity-70 hover:opacity-100 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm opacity-70 hover:opacity-100 transition"
          >
            Already claimed?
          </Link>
        )}

      </div>
    </nav>
  );
}
