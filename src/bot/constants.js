export const TELEGRAM_BOT_VIEW_LIST_MENU_ITEM = "📋 View List";

export const TELEGRAM_BOT_ADD_ITEMS_MENU_ITEM = "➕ Add Items";

export const TELEGRAM_BOT_CANCEL_ADD_ITEMS_MENU_ITEM = "❌ Cancel";

export const TELEGRAM_BOT_CANCEL_MARK_ITEMS_BOUGHT_MENU_ITEM = "✅ Mark Items Bought";

export const TELEGRAM_BOT_MAIN_MENU = {
  reply_markup: {
    keyboard: [
      [TELEGRAM_BOT_VIEW_LIST_MENU_ITEM],
      [TELEGRAM_BOT_ADD_ITEMS_MENU_ITEM],
      [TELEGRAM_BOT_CANCEL_MARK_ITEMS_BOUGHT_MENU_ITEM]
    ],
    resize_keyboard: true
  }
};

export const TELEGRAM_BOT_ADD_ITEMS_MENU = {
  reply_markup: {
    keyboard: [[TELEGRAM_BOT_CANCEL_ADD_ITEMS_MENU_ITEM]],
    resize_keyboard: true
  }
};

export const MENU_ITEM_ERROR = "❌ Sorry, something went wrong.\nPlease try again in a moment.";