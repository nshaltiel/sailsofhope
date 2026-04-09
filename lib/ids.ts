const adjectives = ["brave", "calm", "bright", "warm", "kind", "wise", "bold", "swift", "gentle", "happy"];
const nouns = ["otter", "wave", "sail", "anchor", "compass", "harbor", "tide", "shore", "lighthouse", "dolphin"];

export function makeSlug() {
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${a}-${n}-${num}`;
}

export function makeHostCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
