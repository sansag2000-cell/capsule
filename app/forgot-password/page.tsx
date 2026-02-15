"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://capsule-md7o7pbpz-sanskritis-projects-ad4cdd28.vercel.app/reset-password",

    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Reset link sent to your email.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <h1 className="text-4xl font-bold mb-8">Reset Password</h1>

      <input
        type="email"
        placeholder="Enter your email"
        className="w-full max-w-sm mb-6 p-3 bg-gray-900 text-white rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleReset}
        className="bg-white text-black px-6 py-3 rounded-full font-semibold"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </main>
  );
}
