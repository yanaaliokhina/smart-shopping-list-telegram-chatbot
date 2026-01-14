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
};