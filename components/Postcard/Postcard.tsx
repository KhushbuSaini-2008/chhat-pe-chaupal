"use client";

import { useEffect, useState } from "react";

type P = { id: string; nickname: string; avatar: string; score: number };

const AWARDS = [
  "Paheli Champion 👑",
  "Dimaag Ka Dhani 🧠",
  "Taaliyon Ki Hakdaar 👏",
  "Mazedaar Mehmaan 🎉",
  "Chhupa Rustam 🦸",
  "Silent Genius 🤫",
];

const short = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1) + "…" : s;

function awardFor(i: number, total: number) {
  if (total > 2 && i === total - 1) return AWARDS[5];
  return AWARDS[Math.min(i, 4)];
}

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function drawCard(players: P[], code: string): Promise<string> {
  try {
    await document.fonts?.ready;
  } catch {}
  const family = getComputedStyle(document.body).fontFamily || "sans-serif";
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1e1038");
  bg.addColorStop(0.5, "#2e1a5c");
  bg.addColorStop(1, "#1e1038");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#f5a623";
  ctx.lineWidth = 8;
  rr(ctx, 30, 30, W - 60, H - 60, 40);
  ctx.stroke();

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  // Stars
  ctx.font = `40px ${family}`;
  [
    [100, 300],
    [985, 290],
    [130, 520],
    [950, 540],
    [100, 700],
    [985, 720],
  ].forEach(([x, y]) => ctx.fillText("✨", x, y));

  // Header
  ctx.fillStyle = "#f5a623";
  ctx.font = `bold 80px ${family}`;
  ctx.fillText("🪔 Chhat Pe Chaupal", W / 2, 120);
  ctx.fillStyle = "#fff6e5";
  ctx.font = `bold 52px ${family}`;
  ctx.fillText(`Diwali ${new Date().getFullYear()}`, W / 2, 195);
  ctx.globalAlpha = 0.8;
  ctx.font = `34px ${family}`;
  ctx.fillText("Jahan bachpan phir se zinda hota hai.", W / 2, 250);
  ctx.globalAlpha = 1;

  // Winner
  const win = players[0];
  if (win) {
    ctx.fillStyle = "#f5a623";
    ctx.beginPath();
    ctx.arc(W / 2, 410, 115, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `140px ${family}`;
    ctx.fillText(win.avatar, W / 2, 420);
    ctx.fillStyle = "#f5a623";
    ctx.font = `bold 62px ${family}`;
    ctx.fillText(short(win.nickname, 14), W / 2, 590);
    ctx.fillStyle = "#fff6e5";
    ctx.font = `40px ${family}`;
    ctx.fillText(AWARDS[0], W / 2, 648);
    ctx.font = `bold 44px ${family}`;
    ctx.fillText(`${win.score} points`, W / 2, 705);
  }

  // Other players (ranks 2 to 6)
  players.slice(1, 6).forEach((p, k) => {
    const i = k + 1;
    const y = 770 + k * 90;
    ctx.fillStyle = "rgba(255,255,255,0.09)";
    rr(ctx, 90, y, W - 180, 78, 24);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = `46px ${family}`;
    ctx.fillText(p.avatar, 150, y + 40);

    ctx.textAlign = "left";
    ctx.fillStyle = "#fff6e5";
    ctx.font = `bold 36px ${family}`;
    ctx.fillText(short(p.nickname, 14), 205, y + 27);
    ctx.fillStyle = "#f5a623";
    ctx.font = `26px ${family}`;
    ctx.fillText(awardFor(i, players.length), 205, y + 57);

    ctx.textAlign = "right";
    ctx.font = `bold 42px ${family}`;
    ctx.fillText(String(p.score), W - 130, y + 40);
  });

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff6e5";
  ctx.font = `bold 34px ${family}`;
  ctx.fillText("Ek aur round khelte hain? 😉", W / 2, 1255);
  ctx.globalAlpha = 0.7;
  ctx.font = `26px ${family}`;
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const extra = players.length > 6 ? ` • +${players.length - 6} aur dost` : "";
  ctx.fillText(`Room ${code} • ${date}${extra}`, W / 2, 1295);
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}

export default function Postcard({
  players,
  code,
}: {
  players: P[];
  code: string;
}) {
  const [url, setUrl] = useState("");

  // Stable key, so the card is not redrawn on every re-render
  const key = JSON.stringify(
    players.map((p) => [p.avatar, p.nickname, p.score])
  );

  useEffect(() => {
    let alive = true;
    drawCard(players, code).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, code]);

  function download() {
    const a = document.createElement("a");
    a.href = url;
    a.download = "chhat-pe-chaupal.png";
    a.click();
  }

  async function share() {
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "chhat-pe-chaupal.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: "Hamari Diwali ki yaadein 🪔 Chhat Pe Chaupal",
        });
        return;
      }
    } catch {
      return;
    }
    download();
  }

  return (
    <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-3">
      <h2 className="text-xl font-bold text-cream">Yaadon Ka Postcard 💌</h2>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Chhat Pe Chaupal memory card"
          className="w-full rounded-2xl shadow-xl"
        />
      ) : (
        <p className="text-cream/70">Postcard ban raha hai...</p>
      )}
      {url && (
        <div className="flex w-full gap-3">
          <button
            onClick={share}
            className="flex-1 rounded-full bg-green-500 py-3 font-bold text-white"
          >
            📲 Share
          </button>
          <button
            onClick={download}
            className="flex-1 rounded-full border-2 border-marigold py-3 font-bold text-marigold"
          >
            ⬇️ Download
          </button>
        </div>
      )}
    </div>
  );
}