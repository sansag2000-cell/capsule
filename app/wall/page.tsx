"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export default function MemoryWall() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const TOTAL_SLOTS = 2000; // you can increase later

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .not("username", "is", null);

      if (error) {
        console.log(error);
        return;
      }

      setProfiles(data || []);
    };

    loadProfiles();
  }, []);

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      
      {/* Title */}
      <div className="absolute top-10 w-full text-center text-white text-3xl font-bold">
        🌌 Memory Wall
      </div>

      {/* Pixel Grid */}
      <div className="grid grid-cols-40 gap-3 p-10 mt-32 justify-items-center">
        {Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
          const profile = profiles[index];

          return profile ? (
            <Link
              key={index}
              href={`/capsule/${profile.username}`}
              className="group"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover
                             shadow-[0_0_12px_rgba(255,255,255,0.4)]
                             group-hover:scale-110
                             group-hover:shadow-[0_0_20px_rgba(255,255,255,0.8)]
                             transition duration-300"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full bg-purple-500
                             shadow-[0_0_12px_rgba(168,85,247,0.7)]
                             group-hover:scale-110
                             group-hover:shadow-[0_0_20px_rgba(168,85,247,1)]
                             transition duration-300"
                />
              )}
            </Link>
          ) : (
            <div
              key={index}
              className="w-8 h-8 rounded-full bg-purple-700
                         shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            />
          );
        })}
      </div>
    </main>
  );
}
