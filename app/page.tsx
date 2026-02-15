"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export default function Home() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const GRID_SIZE = 100; // 100 x 100 = 10,000
  const TOTAL_SLOTS = GRID_SIZE * GRID_SIZE;

  useEffect(() => {
    const loadProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .not("username", "is", null);

      setProfiles(data || []);
    };

    loadProfiles();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6">
      <div
        className="grid gap-1 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          maxWidth: "1000px",
        }}
      >
        {Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
          const profile = profiles[index];

          return (
            <div
              key={index}
              onClick={() =>
                profile
                  ? router.push(`/capsule/${profile.username}`)
                  : router.push("/signup")
              }
              className="aspect-square bg-purple-700 hover:scale-110 transition cursor-pointer overflow-hidden"
            >
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
