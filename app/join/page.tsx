"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { AVATARS } from "@/lib/room";

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState((params.get("code") ?? "").toUpperCase());
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin() {
    const roomCode = code.trim().toUpperCase();
    if (!roomCode || !nickname.trim()) {
      setError("Code aur naam dono chahiye!");
      return;
    }
    setLoading(true);
    setError("");

    const { data: room } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", roomCode)
      .maybeSingle();

    if (!room) {
      setError("Ye Chaupal nahi mili. Code check karo.");
      setLoading(false);
      return;
    }

    const { data: player, error: pErr } = await supabase
      .from("players")
      .insert({ room_id: room.id, nickname: nickname.trim(), avatar })
      .select()
      .single();

    if (pErr || !player) {
      setError("Join nahi ho paya. Dobara try karo.");
      setLoading(false);
      return;
    }

    localStorage.setItem(`cpc_player_${roomCode}`, player.id);
    router.push(`/room/${roomCode}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-midnight px-6 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-midnight-light p-6 shadow-xl">
        <h1 className="text-center text-3xl font-extrabold text-marigold">
          🎉 Join a Chaupal
        </h1>

        <label className="mt-6 block text-sm text-cream/80">Room code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          placeholder="ABC123"
          className="mt-1 w-full rounded-2xl bg-cream px-4 py-3 text-center text-2xl font-bold tracking-widest text-midnight outline-none"
        />

        <label className="mt-5 block text-sm text-cream/80">Tumhara naam</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={15}
          placeholder="e.g. Dadi"
          className="mt-1 w-full rounded-2xl bg-cream px-4 py-3 text-lg text-midnight outline-none"
        />

        <label className="mt-5 block text-sm text-cream/80">Avatar chuno</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              className={`h-12 w-12 rounded-full text-2xl ${
                avatar === a ? "bg-marigold" : "bg-midnight"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-marigold py-3 text-xl font-bold text-midnight disabled:opacity-60"
        >
          {loading ? "Aa rahe hain..." : "Chaupal mein aao!"}
        </button>
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}