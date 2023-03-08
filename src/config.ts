import { load } from "https://deno.land/std@0.178.0/dotenv/mod.ts";

const env = await load();

export const BOT_TOKEN = env.BOT_TOKEN.trim();
if (!BOT_TOKEN) {
  throw new Error("Missing BOT_TOKEN in .env file");
}

export const ALLOWED = env.ALLOWED.split(",")
  .map((user) => parseInt(user.trim()))
  .filter(Boolean);
if (!ALLOWED) {
  throw new Error("Missing ALLOWED in .env file");
} else if (ALLOWED.length === 0) {
  throw new Error("ALLOWED doesn't contain inside. Please fix .env file");
}
