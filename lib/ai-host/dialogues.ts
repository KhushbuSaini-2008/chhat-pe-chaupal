type Line = { show: string; say: string };

export const DIALOGUES: Record<string, Line[]> = {
  roomStart: [
    { show: "Chalo ji, chaupal saj gayi!", say: "चलो जी, चौपाल सज गई!" },
    { show: "Namasteeee! Sab aa gaye?", say: "नमस्ते! सब आ गए?" },
  ],
  correct: [
    { show: "Wahhh! Kya dimaag paaya hai!", say: "वाह! क्या दिमाग पाया है!" },
    { show: "Sahi jawab! Taali bajao!", say: "सही जवाब! ताली बजाओ!" },
  ],
  wrong: [
    { show: "Close tha, par dil ke paas!", say: "क्लोज़ था, पर दिल के पास!" },
    { show: "Arrey! Ek aur try karo agli baar!", say: "अरे! अगली बार एक और कोशिश करना!" },
  ],
  timeUp: [
    { show: "Time khatam! Dekhte hain sahi jawab kya tha!", say: "टाइम खत्म! देखते हैं सही जवाब क्या था!" },
  ],
  nobodyCorrect: [
    { show: "Arrey, kisi ko nahi pata? Dadi se poochho!", say: "अरे, किसी को नहीं पता? दादी से पूछो!" },
  ],
  nextRound: [
    { show: "Chalo, ab agli paheli!", say: "चलो, अब अगली पहेली!" },
  ],
  winner: [
    { show: "Aaj ka Paheli Champion mil gaya!", say: "आज का पहेली चैंपियन मिल गया!" },
  ],
  gameEnd: [
    { show: "Bas? Itni jaldi? Ek aur round khelte hain!", say: "बस? इतनी जल्दी? एक और राउंड खेलते हैं!" },
  ],
};

export function pickLine(key: keyof typeof DIALOGUES): Line {
  const lines = DIALOGUES[key];
  return lines[Math.floor(Math.random() * lines.length)];
}