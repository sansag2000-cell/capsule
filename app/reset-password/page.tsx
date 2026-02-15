"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRecovery = async () => {
      // This exchanges the access_token from the URL
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
      }

      setLoading(false);
    };

    handleRecovery();
  }, []);

  const handleUpdatePassword = async () => {
    if (!password) {
      alert("Enter a new password");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully!");
      router.push("/login");
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <h1 className="text-4xl font-bold mb-8">Set New Password</h1>

      <input
        type="password"
        placeholder="New Password"
        className="w-full max-w-sm mb-6 p-3 bg-gray-900 text-white rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleUpdatePassword}
        className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
      >
        Update Password
      </button>
    </main>
  );
}
