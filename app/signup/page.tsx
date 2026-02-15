"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    // 1️⃣ Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      alert("Signup failed.");
      return;
    }

    // 2️⃣ Insert into profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          name: name,
          email: email,
        },
      ]);

    if (profileError) {
      alert(profileError.message);
      return;
    }

    // 3️⃣ Redirect to homepage
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold mb-6">Sign Up</h1>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full max-w-sm p-3 mb-4 rounded bg-gray-900"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-sm p-3 mb-4 rounded bg-gray-900"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full max-w-sm p-3 mb-6 rounded bg-gray-900"
      />

      <button
        onClick={handleSignup}
        className="bg-white text-black px-6 py-3 rounded-full font-semibold"
      >
        Create Account
      </button>
    </main>
  );
}
