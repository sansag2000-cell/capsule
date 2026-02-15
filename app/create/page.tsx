"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type CapsuleItem = {
  id: number;
  file_size_mb: number | null;
};

export default function Create() {
  const router = useRouter();

  const [unlockDate, setUnlockDate] = useState("");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [capsuleId, setCapsuleId] = useState<number | null>(null);
  const [items, setItems] = useState<CapsuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const MAX_ITEMS = 5;
  const MAX_SIZE_MB = 25;

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }

      const { data: capsule } = await supabase
        .from("capsules")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (capsule) {
        setCapsuleId(capsule.id);

        const { data: itemsData } = await supabase
          .from("capsule_items")
          .select("id, file_size_mb")
          .eq("capsule_id", capsule.id);

        setItems(itemsData || []);
      }

      setLoading(false);
    };

    init();
  }, []);

  const totalSize = items.reduce(
    (sum, item) => sum + (item.file_size_mb || 0),
    0
  );

  const handleCreateCapsule = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    if (!unlockDate) {
      alert("Select unlock date");
      return;
    }

    if (new Date(unlockDate) <= new Date()) {
      alert("Unlock date must be in the future.");
      return;
    }

    const { data, error } = await supabase
      .from("capsules")
      .insert([
        {
          user_id: session.user.id,
          unlock_date: unlockDate,
        },
      ])
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setCapsuleId(data.id);
    alert("Capsule created!");
  };

  const handleAddItem = async () => {
    if (!capsuleId) {
      alert("Create capsule first.");
      return;
    }

    if (items.length >= MAX_ITEMS) {
      alert("Maximum 5 items allowed.");
      return;
    }

    let fileSizeMB = 0;
    let fileUrl = null;
    let type = "text";

    // TEXT ITEM
    if (message && !file) {
      type = "text";
    }

    // FILE ITEM
    if (file) {
      fileSizeMB = file.size / (1024 * 1024);

      if (totalSize + fileSizeMB > MAX_SIZE_MB) {
        alert("25MB total limit exceeded.");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "audio/mpeg",
        "application/pdf",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type.");
        return;
      }

      type = file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : "pdf";

      const fileName = `${capsuleId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("capsule-files")
        .upload(fileName, file);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("capsule-files")
        .getPublicUrl(fileName);

      fileUrl = data.publicUrl;
    }

    const { error } = await supabase.from("capsule_items").insert([
      {
        capsule_id: capsuleId,
        type,
        text_content: message || null,
        content_url: fileUrl,
        is_public: isPublic,
        file_size_mb: fileSizeMB,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setItems([...items, { id: Date.now(), file_size_mb: fileSizeMB }]);
    setMessage("");
    setFile(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Create Your Capsule</h1>

      <div className="bg-gray-900 p-6 rounded-lg mb-6">
        <p>Used: {totalSize.toFixed(2)}MB / 25MB</p>
        <p>Items: {items.length} / 5</p>

        <div className="w-full bg-gray-700 rounded h-2 mt-2">
          <div
            className="bg-white h-2 rounded"
            style={{
              width: `${(totalSize / 25) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {!capsuleId ? (
        <>
          <input
            type="date"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            className="p-3 bg-gray-900 rounded mb-4 w-full"
          />
          <button
            onClick={handleCreateCapsule}
            className="bg-white text-black px-6 py-2 rounded"
          >
            Create Capsule
          </button>
        </>
      ) : (
        <>
          <textarea
            placeholder="Write something..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 bg-gray-900 rounded mb-4"
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4"
          />

          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={() => setIsPublic(!isPublic)}
            />
            Make this public
          </label>

          <button
            onClick={handleAddItem}
            className="bg-white text-black px-6 py-2 rounded"
          >
            Add Item
          </button>
        </>
      )}
    </main>
  );
}
