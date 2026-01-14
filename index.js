import { initDb } from "./src/db/index.js";
import { initBot } from "./src/bot/index.js";

initDb();
initBot();

console.log("🤖 Telegram Shopping Bot started");