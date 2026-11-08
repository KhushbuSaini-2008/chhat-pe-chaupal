
"use client";
import { useWelcome } from "@/lib/ai-host/useWelcome";
import { useChutkiVoice } from "@/lib/ai-host/useChutkiVoice";

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

type Round = {
    question_id: string;
  id: string;
  round_number: number;
  question_text: string;
  hint: string | null;
  points: number;
  ends_at: string;
};

type Result = { roundId: string; correct: boolean; points: number } | null;

type RevealData = {
  answer: string;
  winners: { nickname: string; avatar: string; points: number }[];
};

function RoomContent() {
  const { roomId } = useParams<{ roomId: string }>();
  const code = roomId.toUpperCase();
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const [roomStatus, setRoomStatus] = useState("lobby");
  const [round, setRound] = useState<Round | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState<RevealData | null>(null);

  const secondsLeft = round
    ? Math.max(0, Math.ceil((new Date(round.ends_at).getTime() - now) / 1000))
    : 0;
  const timeUp = !!round && secondsLeft === 0;

  // Clock tick for the countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
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

    async function loadLatestRound(roomDbId: string) {
      const { data } = await supabase
        .from("game_rounds")
        .select("*")
        .eq("room_id", roomDbId)
        .order("round_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data) setRound(data as Round);
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
      setRoomStatus(room.status);

      await loadPlayers(room.id);
      await loadLatestRound(room.id);
      if (cancelled) return;

      channel = supabase
        .channel(`room-${room.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "players", filter: `room_id=eq.${room.id}` },
          () => loadPlayers(room.id)
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "game_rounds", filter: `room_id=eq.${room.id}` },
          () => loadLatestRound(room.id)
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
          (payload) => setRoomStatus((payload.new as { status: string }).status)
        )
        .subscribe();
    }

    init();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [code, router]);

  // Reset the answer box when a new round arrives
  useEffect(() => {
    setAnswer("");
    setMessage("");
    setReveal(null);
  }, [round?.id]);

  // Load result when time is up
  useEffect(() => {
    if (timeUp && round?.id && meId && !reveal) {
      fetch("/api/game/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId: round.id, playerId: meId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.answer) setReveal(data);
        })
        .catch((err) => console.error("Reveal error:", err));
    }
  }, [timeUp, round?.id, meId, reveal]);

  const me = players.find((p) => p.id === meId);
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const myResult = result && round && result.roundId === round.id ? result : null;
  useChutkiVoice({ roundId: round?.id, questionId: round?.question_id, timeUp, myResult, roomStatus });
  useWelcome(players, meId);
const [origin, setOrigin] = useState("");
useEffect(() => {
  setOrigin(window.location.origin);
}, []);
const inviteLink = origin ? `${origin}/join?code=${code}` : "";

  const whatsappText = encodeURIComponent(
    `Chalo Chhat Pe Chaupal khelte hain! 🪔 Room code: ${code}\n${inviteLink}`
  );

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function startRound() {
    if (!meId) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/game/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode: code, playerId: meId }),
    });
    const data = await res.json();
    if (data.finished) setRoomStatus("finished");
    else if (data.round) setRound(data.round as Round);
    else setMessage(data.error ?? "Kuch gadbad ho gayi");
    setBusy(false);
  }

  async function submitAnswer() {
    if (!meId || !round || !answer.trim()) return;
    setBusy(true);
    const res = await fetch("/api/game/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId: round.id, playerId: meId, answer }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult({ roundId: round.id, correct: data.correct, points: data.points });
    } else if (res.status === 409) {
      setMessage("Tumne jawab de diya hai!");
    } else {
      setMessage(data.error ?? "Jawab nahi gaya");
    }
    setBusy(false);
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight text-cream">
        <p className="text-xl">Ye Chaupal nahi mili 😕</p>
      </main>
    );
  }

  const leaderboard = (
    <ul className="mt-3 w-full max-w-xs space-y-2">
      {ranked.map((p, i) => (
        <li
          key={p.id}
          className="flex items-center gap-3 rounded-2xl bg-midnight-light px-4 py-3 text-left"
        >
          <span className="w-6 text-lg font-bold text-marigold">{i + 1}</span>
          <span className="text-3xl">{p.avatar}</span>
          <span className="flex-1 text-lg font-semibold text-cream">
            {p.nickname}
            {p.id === meId && " (tum)"}
          </span>
          <span className="text-xl font-extrabold text-marigold">{p.score}</span>
        </li>
      ))}
    </ul>
  );

  // FINISHED
  if (roomStatus === "finished") {
    return (
      <main className="flex min-h-screen flex-col items-center bg-midnight px-6 py-10 text-center">
        <div className="text-6xl">🏆</div>
        <h1 className="mt-3 text-3xl font-extrabold text-marigold">Game khatam!</h1>
        {ranked[0] && (
          <p className="mt-2 text-xl text-cream">
            {ranked[0].avatar} {ranked[0].nickname} jeet gaya/gayi!
          </p>
        )}
        {leaderboard}
        <p className="mt-6 text-cream/70">Ek aur round khelte hain? Jaldi aa raha hai 😉</p>
      </main>
    );
  }

  // PLAYING
  if (round) {
    const showNext = me?.is_host && timeUp;
    return (
      <main className="flex min-h-screen flex-col items-center bg-midnight px-6 py-8 text-center">
        <p className="text-sm text-cream/70">
          Round {round.round_number} • {round.points} points
        </p>

        <div className="mt-3 flex h-20 w-20 items-center justify-center rounded-full bg-marigold text-4xl font-extrabold text-midnight">
          {secondsLeft}
        </div>

        <div className="mt-5 w-full max-w-sm rounded-3xl bg-cream px-5 py-5 text-midnight">
          <p className="text-xl font-semibold">{round.question_text}</p>
        </div>
        {round.hint && secondsLeft <= 10 && !timeUp && (
          <p className="mt-3 text-cream/80">💡 Hint: {round.hint}</p>
        )}

        {!timeUp && !myResult && (
          <div className="mt-5 flex w-full max-w-sm flex-col gap-3">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
              maxLength={100}
              placeholder="Apna jawab likho..."
              className="rounded-2xl bg-cream px-4 py-3 text-lg text-midnight outline-none"
            />
            <button
              onClick={submitAnswer}
              disabled={busy}
              className="rounded-full bg-marigold py-3 text-xl font-bold text-midnight disabled:opacity-60"
            >
              Jawab bhejo!
            </button>
          </div>
        )}

        {myResult && (
          <p className="mt-5 text-2xl font-bold text-cream">
            {myResult.correct ? `Wahhh! Sahi jawab! +${myResult.points} 🎉` : "Close tha, par dil ke paas! 😅"}
          </p>
        )}
        {timeUp && !myResult && (
          <p className="mt-5 text-xl text-cream">Time khatam! ⏰</p>
        )}

        {reveal && (
          <div className="mt-6 w-full max-w-sm rounded-3xl border-2 border-marigold bg-midnight-light p-5 shadow-xl">
            <p className="text-sm text-marigold uppercase tracking-wider font-bold">Sahi jawab</p>
            <p className="mt-1 text-2xl font-extrabold text-cream">{reveal.answer}</p>

            <div className="mt-4 border-t border-cream/10 pt-4">
              {reveal.winners.length > 0 ? (
                <>
                  <p className="text-sm text-cream/70 mb-2">Inhone sahi bataya: 🏆</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {reveal.winners.map((w, i) => (
                      <div key={i} className="flex items-center gap-1 rounded-full bg-midnight px-3 py-1 text-sm border border-marigold/30">
                        <span>{w.avatar}</span>
                        <span className="font-semibold text-cream">{w.nickname}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-cream/70 italic">Is baar kisi ne sahi nahi bataya! 😅</p>
              )}
            </div>
          </div>
        )}

        {message && <p className="mt-3 text-sm text-red-300">{message}</p>}

        <h2 className="mt-8 text-xl font-bold text-cream">Leaderboard</h2>
        {leaderboard}

        {showNext && (
          <button
            onClick={startRound}
            disabled={busy}
            className="mt-6 w-full max-w-xs rounded-full bg-marigold py-3 text-xl font-bold text-midnight disabled:opacity-60"
          >
            Agla round ▶
          </button>
        )}
        {timeUp && !me?.is_host && (
          <p className="mt-6 text-cream/70">Host agla round shuru karenge...</p>
        )}
      </main>
    );
  }

  // LOBBY
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
      <p className="text-5xl font-extrabold tracking-widest text-marigold">{code}</p>

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

      <h2 className="mt-8 text-xl font-bold text-cream">Chaupal mein ({players.length})</h2>
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

      {message && <p className="mt-4 text-sm text-red-300">{message}</p>}

      {me?.is_host ? (
        <button
          onClick={startRound}
          disabled={busy}
          className="mt-8 w-full max-w-xs rounded-full bg-marigold py-3 text-xl font-bold text-midnight disabled:opacity-60"
        >
          ▶ Game shuru karo
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
