"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Player = {
  id: string;
  nickname: string;
  avatar: string;
  is_host: boolean;
  score: number;
};

function RoomContent() {
  const { roomId } = useParams<{ roomId: string }>();
  const code = roomId.toUpperCase();
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  // Browser mein hi origin set hoga, taaki server aur client ka HTML match kare
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function loadPlayers(roomDbId: string) {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomDbId)
        .order("joined_at");
      if (!cancelled && data) setPlayers(data as Player[]);
    }

    async function init() {
      const { data: room } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", code)
        .maybeSingle();

      if (cancelled) return;
      if (!room) {
        setNotFound(true);
        return;
      }

      const myId = localStorage.getItem(`cpc_player_${code}`);
      if (!myId) {
        router.replace(`/join?code=${code}`);
        return;
      }
      setMeId(myId);

      await loadPlayers(room.id);
      if (cancelled) return;

      channel = supabase
        .channel(`room-${room.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "players",
            filter: `room_id=eq.${room.id}`,
          },
          () => loadPlayers(room.id)
        )
        .subscribe();
    }

    init();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [code, router]);

  const inviteLink = origin ? `${origin}/join?code=${code}` : "";
  const whatsappText = encodeURIComponent(
    `Chalo Chhat Pe Chaupal khelte hain! 🪔 Room code: ${code}\n${inviteLink}`
  );
  const me = players.find((p) => p.id === meId);

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight text-cream">
        <p className="text-xl">Ye Chaupal nahi mili 😕</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-midnight px-6 py-10 text-center">
      <div className="text-5xl">👧</div>
      <div className="mt-3 rounded-3xl bg-cream px-5 py-3 text-midnight">
        <p className="font-semibold">
          {players.length <= 1
            ? "Arrey, abhi toh sirf tum ho! Baaki ko bulao!"
            : `Wah! ${players.length} log aa gaye! 🎉`}
        </p>
      </div>

      <p className="mt-8 text-sm text-cream/70">Room code</p>
      <p className="text-5xl font-extrabold tracking-widest text-marigold">
        {code}
      </p>

      <div className="mt-5 flex w-full max-w-xs flex-col gap-3">
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-green-500 py-3 text-lg font-bold text-white"
        >
          📲 WhatsApp pe bulao
        </a>
        <button
          onClick={copyLink}
          className="rounded-full border-2 border-marigold py-3 text-lg font-bold text-marigold"
        >
          {copied ? "✅ Link copy ho gaya" : "🔗 Link copy karo"}
        </button>
      </div>

      <h2 className="mt-8 text-xl font-bold text-cream">
        Chaupal mein ({players.length})
      </h2>
      <ul className="mt-3 w-full max-w-xs space-y-2">
        {players.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-2xl bg-midnight-light px-4 py-3 text-left"
          >
            <span className="text-3xl">{p.avatar}</span>
            <span className="flex-1 text-lg font-semibold text-cream">
              {p.nickname}
              {p.id === meId && " (tum)"}
            </span>
            {p.is_host && (
              <span className="rounded-full bg-marigold px-2 py-0.5 text-xs font-bold text-midnight">
                HOST
              </span>
            )}
          </li>
        ))}
      </ul>

      {me?.is_host ? (
        <button
          disabled
          className="mt-8 w-full max-w-xs rounded-full bg-marigold/50 py-3 text-xl font-bold text-midnight"
        >
          ▶ Game shuru karo (jaldi aa raha hai)
        </button>
      ) : (
        <p className="mt-8 text-cream/70">Host ke game shuru karne ka wait...</p>
      )}
    </main>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-midnight text-cream">
          Loading your Chaupal...
        </main>
      }
    >
      <RoomContent />
    </Suspense>
  );
}