export class ItemService {
    constructor(db) {
        this.db = db;
    }

    getItems(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT * FROM items WHERE user_id = ?",
                [userId],
                (err, rows) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(rows ?? []);
                }
            );
        });
    }

    getUnboughtItems(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT * FROM items WHERE user_id = ? AND bought IS FALSE",
                [userId],
                (err, rows) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(rows ?? []);
                }
            );
        });
    }

    addItem(userId, name) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "INSERT INTO items (user_id, name) VALUES (?, ?)",
                [userId, name],
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: this?.lastID });
                }
            );
        });
    }

    markBought(itemId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "UPDATE items SET bought = TRUE WHERE id = ?",
                [itemId],
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ changes: this?.changes });
                }
            );
        });
    }
}
