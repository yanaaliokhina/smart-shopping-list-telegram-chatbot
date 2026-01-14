import { describe, jest, beforeEach, test, expect } from "@jest/globals";
import { TelegramBotCommandHandler } from "../handler.js";
import {
    TELEGRAM_BOT_MAIN_MENU,
    TELEGRAM_BOT_ADD_ITEMS_MENU,
    MENU_ITEM_ERROR
} from "../constants.js";

describe("TelegramBotCommandHandler", () => {
    let userService;
    let itemService;
    let bot;
    let handler;

    const baseMsg = {
        chat: { id: 100 },
        from: { id: 200 },
        text: ""
    };

    beforeEach(() => {
        userService = {
            getOrCreateUser: jest.fn()
        };

        itemService = {
            getItems: jest.fn(),
            getUnboughtItems: jest.fn(),
            addItem: jest.fn(),
            markBought: jest.fn()
        };

        bot = {
            sendMessage: jest.fn(),
            editMessageReplyMarkup: jest.fn(),
            answerCallbackQuery: jest.fn()
        };

        handler = new TelegramBotCommandHandler(userService, itemService, bot);
    });

    describe("handleStartCommand()", () => {
        test("sends welcome message", async () => {
            userService.getOrCreateUser.mockResolvedValue(1);

            await handler.handleStartCommand(baseMsg);

            expect(userService.getOrCreateUser).toHaveBeenCalledWith(200);
            expect(bot.sendMessage).toHaveBeenCalledWith(
                100,
                expect.stringContaining("Welcome"),
                expect.objectContaining(TELEGRAM_BOT_MAIN_MENU)
            );
        });

        test("shows error message on failure", async () => {
            userService.getOrCreateUser.mockRejectedValue(new Error("DB error"));

            await handler.handleStartCommand(baseMsg);

            expect(bot.sendMessage).toHaveBeenCalledWith(100, MENU_ITEM_ERROR);
        });
    });

    describe("handleStopCommand()", () => {
        test("sends stop message and removes keyboard", async () => {
            await handler.handleStopCommand(baseMsg);

            expect(bot.sendMessage).toHaveBeenCalledWith(
                100,
                expect.stringContaining("Bot stopped"),
                { reply_markup: { remove_keyboard: true } }
            );
        });
    });

    describe("handleViewListCommand()", () => {
        test("shows empty list message", async () => {
            userService.getOrCreateUser.mockResolvedValue(1);
            itemService.getItems.mockResolvedValue([]);

            await handler.handleViewListCommand(baseMsg);

            expect(bot.sendMessage).toHaveBeenCalledWith(
                100,
                "🛍️ Your list is empty!",
                TELEGRAM_BOT_MAIN_MENU
            );
        });

        test("shows formatted list of items", async () => {
            userService.getOrCreateUser.mockResolvedValue(1);
            itemService.getItems.mockResolvedValue([
                { name: "Milk", bought: false },
                { name: "Bread", bought: true }
            ]);

            await handler.handleViewListCommand(baseMsg);

            expect(bot.sendMessage).toHaveBeenCalledWith(
                100,
                expect.stringContaining("Milk"),
                expect.objectContaining({ parse_mode: "Markdown" })
            );
        });
    });

    describe("handleAddItemsCommand()", () => {
        test("sets ADDING_ITEMS mode and shows prompt", async () => {
            await handler.handleAddItemsCommand(baseMsg);

            expect(handler.userState.get(200)).toEqual({ mode: "ADDING_ITEMS" });
            expect(bot.sendMessage).toHaveBeenCalledWith(
                100,
                expect.stringContaining("Send an item name"),
                TELEGRAM_BOT_ADD_ITEMS_MENU
            );
        });
    });

    describe("handleTextTypingCommand()", () => {
        test("adds item when in ADDING_ITEMS mode", async () => {
            handler.userState.set(200, { mode: "ADDING_ITEMS" });
            userService.getOrCreateUser.mockResolvedValue(1);
            itemService.addItem.mockResolvedValue();

            await handler.handleTextTypingCommand({
                ...baseMsg,
                text: "Milk"
            });

            expect(itemService.addItem).toHaveBeenCalledWith(1, "Milk");
            expect(bot.sendMessage).toHaveBeenCalled();
        });

        test("ignores input when not in ADDING_ITEMS mode", async () => {
            await handler.handleTextTypingCommand({
                ...baseMsg,
                text: "Milk"
            });

            expect(itemService.addItem).not.toHaveBeenCalled();
            expect(bot.sendMessage).not.toHaveBeenCalled();
        });
    });

    describe("handleCancelAddItemsCommand()", () => {
        test("exits add mode and shows main menu", async () => {
            handler.userState.set(200, { mode: "ADDING_ITEMS" });
            userService.getOrCreateUser.mockResolvedValue(200);

            await handler.handleCancelAddItemsCommand(baseMsg);

            expect(handler.userState.has(200)).toBe(false);
            expect(bot.sendMessage).toHaveBeenCalledWith(
                100,
                "✅ Add mode exited.",
                TELEGRAM_BOT_MAIN_MENU
            );
        });
    });

    describe("handleMarkItemsBoughtCommand()", () => {
        test("shows message when no unbought items exist", async () => {
            userService.getOrCreateUser.mockResolvedValue(1);
            itemService.getUnboughtItems.mockResolvedValue([]);

            await handler.handleMarkItemsBoughtCommand(baseMsg);

            expect(bot.sendMessage).toHaveBeenCalledWith(
                100,
                "🎉 All items already bought!",
                TELEGRAM_BOT_MAIN_MENU
            );
        });

        test("shows inline keyboard with items", async () => {
            userService.getOrCreateUser.mockResolvedValue(1);
            itemService.getUnboughtItems.mockResolvedValue([
                { id: 1, name: "Milk" }
            ]);

            await handler.handleMarkItemsBoughtCommand(baseMsg);

            expect(bot.sendMessage).toHaveBeenCalledWith(
                100,
                "Select items:",
                expect.objectContaining({
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "🛒 Milk", callback_data: "buy_1" }
                        ]]
                    }
                })
            );
        });
    });

    describe("handleCallbackQuery()", () => {
        test("marks item as bought and updates button", async () => {
            itemService.markBought.mockResolvedValue();

            await handler.handleCallbackQuery({
                id: "cb1",
                data: "buy_5",
                message: {
                    chat: { id: 100 },
                    message_id: 10,
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "🛒 Milk", callback_data: "buy_5" }
                        ]]
                    }
                }
            });

            expect(itemService.markBought).toHaveBeenCalledWith("5");
            expect(bot.editMessageReplyMarkup).toHaveBeenCalled();
        });

        test("handles disabled callback without updating DB", async () => {
            await handler.handleCallbackQuery({
                id: "cb1",
                data: "disabled",
                message: { chat: { id: 100 } }
            });

            expect(bot.answerCallbackQuery).toHaveBeenCalled();
            expect(itemService.markBought).not.toHaveBeenCalled();
        });
    });
});
