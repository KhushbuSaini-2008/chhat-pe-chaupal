export const AVATARS = ["👵", "👴", "🧑", "👧", "👦", "👩", "👨", "🐯", "🦚", "🪁"];

// No confusing characters like 0/O or 1/I
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}