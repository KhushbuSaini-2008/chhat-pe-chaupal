export const RIDDLES_PER_ROUND = 5;

export type Theme = {
  name: string;
  emoji: string;
  ids: string[];
  listening?: boolean;
};

export const THEMES: Theme[] = [
  { name: "Bachpan Ki Paheli", emoji: "🧸", ids: ["P001", "P004", "P008", "P017", "P022"] },
  { name: "Diwali Dhamaka", emoji: "🪔", ids: ["P003", "P011", "P012", "P013", "P024"] },
  { name: "Hansi Mazaak", emoji: "😂", ids: ["P005", "P015", "P016", "P021", "P023"] },
  { name: "Dimaag Ghumao", emoji: "🧠", ids: ["P006", "P009", "P010", "P014", "P025"] },
  { name: "Suno Aur Batao", emoji: "🎧", ids: ["P002", "P007", "P018", "P019", "P020"], listening: true },
];

export function themeFor(roundNumber: number) {
  const idx = Math.min(
    Math.floor((roundNumber - 1) / RIDDLES_PER_ROUND),
    THEMES.length - 1
  );
  return {
    theme: THEMES[idx],
    themeNumber: idx + 1,
    questionNumber: ((roundNumber - 1) % RIDDLES_PER_ROUND) + 1,
  };
}