import sqlite3 from "sqlite3";
import { loadEnv } from "../utils/env.js";

const { dbPath } = loadEnv();

export const db = new sqlite3.Database(dbPath);

export function initDb() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                telegram_id INTEGER UNIQUE
            )
        `);

            db.run(`
                CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                bought INTEGER DEFAULT 0,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);
    });
}