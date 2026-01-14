export class ItemService {

    constructor(db) {
        this.db = db;
    }

    getItems(userId) {
        return new Promise((resolve) => {
            this.db.all(
                "SELECT * FROM items WHERE user_id = ?",
                [userId],
                (err, rows) => resolve(rows)
            );
        });
    }

    getUnboughtItems(userId) {
        return new Promise((resolve) => {
            this.db.all(
                "SELECT * FROM items WHERE user_id = ? and bought = 0",
                [userId],
                (err, rows) => resolve(rows)
            );
        });
    }

    addItem(userId, name) {
        return new Promise((resolve) => {
            this.db.run(
                "INSERT INTO items (user_id, name) VALUES (?, ?)",
                [userId, name],
                resolve
            );
        });
    };

    markBought(itemId) {
        return new Promise((resolve) => {
            this.db.run(
                "UPDATE items SET bought = 1 WHERE id = ?",
                [itemId],
                resolve
            );
        });
    }
}