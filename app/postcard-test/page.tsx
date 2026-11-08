"use client";

import Postcard from "@/components/Postcard/Postcard";

const players = [
  { id: "1", nickname: "Dadi", avatar: "👵", score: 120 },
  { id: "2", nickname: "Khushbu", avatar: "👧", score: 90 },
  { id: "3", nickname: "Tanu", avatar: "🦚", score: 70 },
  { id: "4", nickname: "Rahul", avatar: "🧑", score: 40 },
  { id: "5", nickname: "Papa", avatar: "👨", score: 10 },
];

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-midnight px-6 py-10">
      <Postcard players={players} code="TEST12" />
    </main>
  );
}