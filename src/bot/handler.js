import { TELEGRAM_BOT_VIEW_LIST_MENU_ITEM, TELEGRAM_BOT_MAIN_MENU } from "./constants.js";

export class TelegramBotCommandHandler {

    constructor(userService, itemService, bot) {
        this.userService = userService;
        this.itemService = itemService;
        this.bot = bot;
    }

    async handleStartCommand(msg) {
        const chatId = msg.chat.id;
        await this.userService.getOrCreateUser(msg.from.id);

        this.bot.sendMessage(
            chatId,
            "🛒 *Welcome to Shopping List this.bot!*\n\nWhat would you like to do?",
            { parse_mode: "Markdown", ...TELEGRAM_BOT_MAIN_MENU }
        );
    }

    async handleStopCommand(msg) {
        const chatId = msg.chat.id;

        this.bot.sendMessage(
            chatId,
            "👋 Bot stopped. Use /start to activate again.",
            { reply_markup: { remove_keyboard: true } }
        );
    }

    async handleMessageCommand(msg) {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text === TELEGRAM_BOT_VIEW_LIST_MENU_ITEM) {
            const userId = await this.userService.getOrCreateUser(msg.from.id);
            const items = await this.itemService.getItems(userId);

            if (items.length === 0) {
                this.bot.sendMessage(chatId, "🛍️ Your list is empty!", TELEGRAM_BOT_MAIN_MENU);

            } else {
                const list = items
                    .map((i, idx) => `${idx + 1}. ${i.bought ? "✅" : "🟢"} ${i.name}`)
                    .join("\n");

                this.bot.sendMessage(chatId, `📝 *Your Shopping List:*\n\n${list}`, {
                    parse_mode: "Markdown",
                    TELEGRAM_BOT_MAIN_MENU
                });
            }
        }
    }
}
