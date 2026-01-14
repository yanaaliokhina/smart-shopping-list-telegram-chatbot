import TelegramBot from "node-telegram-bot-api";
import { loadEnv } from "../utils/env.js";
import { db } from "../db/index.js";
import { UserService, ItemService } from "../services/index.js";
import { TelegramBotCommandHandler } from "./handler.js";

export function initBot() {
    const userService = new UserService(db);
    const itemService = new ItemService(db);

    const { botToken } = loadEnv();
    const bot = new TelegramBot(botToken, { polling: true });
    const botComandHandler = new TelegramBotCommandHandler(userService, itemService, bot);

    bot.onText(/\/start/, (msg) => botComandHandler.handleStartCommand(msg));
    bot.onText(/\/stop/, (msg) => botComandHandler.handleStopCommand(msg));
    bot.on("message", (msg) => botComandHandler.handleMessageCommand(msg));
    bot.on("callback_query", (query) => botComandHandler.handleCallbackQuery(query));

    return bot;
}