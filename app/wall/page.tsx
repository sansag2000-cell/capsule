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

 useEffect(() => {
  const loadSlots = async () => {
    const { data, error } = await supabase
      .from("wall_slots")
      .select("id, user_id")
      .limit(2000); // start small

    if (error) {
      console.log(error);
      return;
    }

    setSlots(data || []);
  };

  loadSlots();
}, []);
    loadProfiles();
  }, []);

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      
      {/* Title */}
      <div className="absolute top-10 w-full text-center text-white text-3xl font-bold">
        🌌 Memory Wall
      </div>

      {/* Glowing Grid */}
      <div className="grid grid-cols-10 gap-8 p-20 mt-20 justify-items-center">
        {profiles.map((profile) => (
          <Link
            key={profile.id}
            href={`/capsule/${profile.username}`}
            className="group"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover
                           shadow-[0_0_20px_rgba(255,255,255,0.4)]
                           group-hover:scale-110
                           group-hover:shadow-[0_0_35px_rgba(255,255,255,0.8)]
                           transition duration-300"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-full bg-white
                           shadow-[0_0_15px_rgba(255,255,255,0.7)]
                           group-hover:shadow-[0_0_30px_rgba(255,255,255,1)]
                           transition duration-300"
              />
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
