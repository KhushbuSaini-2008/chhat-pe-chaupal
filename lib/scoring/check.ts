export function normalize(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

export function isCorrectAnswer(
  userAnswer: string,
  answer: string,
  accepted: string[]
) {
  const guess = normalize(userAnswer);
  if (!guess) return false;
  return [answer, ...accepted].some((a) => normalize(a) === guess);
}