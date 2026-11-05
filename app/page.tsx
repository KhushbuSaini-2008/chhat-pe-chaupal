"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const stars = [
  { top: "8%", left: "12%", delay: 0 },
  { top: "15%", left: "80%", delay: 0.6 },
  { top: "30%", left: "6%", delay: 1.2 },
  { top: "22%", left: "55%", delay: 0.3 },
  { top: "60%", left: "90%", delay: 0.9 },
  { top: "75%", left: "10%", delay: 1.5 },
  { top: "85%", left: "70%", delay: 0.4 },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-midnight via-midnight-light to-midnight px-6 py-12 text-center">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          style={{ top: s.top, left: s.left }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, delay: s.delay }}
        >
          ✨
        </motion.span>
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="flex h-28 w-28 items-center justify-center rounded-full bg-marigold text-6xl shadow-lg shadow-marigold/40"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          👧
        </motion.div>

        <div className="mt-6 max-w-xs rounded-3xl bg-cream px-5 py-3 text-midnight shadow-md">
          <p className="text-lg font-semibold">
            Namasteeee! Sab aa gaye? Chalo, chaupal sajaate hain! 🪔
          </p>
        </div>

        <h1 className="mt-10 text-5xl font-extrabold text-marigold sm:text-6xl">
          Chhat Pe Chaupal
        </h1>
        <p className="mt-3 text-xl text-cream/80">
          Jahan bachpan phir se zinda hota hai.
        </p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-4">
          <Link
            href="/create"
            className="rounded-full bg-marigold px-8 py-4 text-xl font-bold text-midnight shadow-lg transition hover:scale-105 hover:bg-marigold-dark"
          >
            🏡 Create a Chaupal
          </Link>
          <Link
            href="/join"
            className="rounded-full border-2 border-marigold px-8 py-4 text-xl font-bold text-marigold transition hover:scale-105 hover:bg-marigold/10"
          >
            🎉 Join a Chaupal
          </Link>
        </div>

        <p className="mt-10 text-sm text-cream/60">
          Riddles • Music • Yaadein • Family
        </p>
      </motion.div>
    </main>
  );
}