export class UserService {

    constructor(db) {
        this.db = db;
    }

    getOrCreateUser(telegramId) {
        return new Promise((resolve) => {
            this.db.get(
                "SELECT * FROM users WHERE telegram_id = ?",
                [telegramId],
                (err, row) => {
                    if (row) resolve(row.id);

                    this.db.run(
                        "INSERT INTO users (telegram_id) VALUES (?)",
                        [telegramId],
                        function () {
                            resolve(this.lastID);
                        }
                    );
                }
            );
        });
    }
};