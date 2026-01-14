export class UserService {
    constructor(db) {
        this.db = db;
    }

    getOrCreateUser(telegramId) {
        const db = this.db;

        return new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE telegram_id = ?",
                [telegramId],
                (err, row) => {
                    if (err) {
                        return reject(err);
                    }

                    if (row) {
                        return resolve(row.id);
                    }

                    db.run(
                        "INSERT INTO users (telegram_id) VALUES (?)",
                        [telegramId],
                        function (err) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(this.lastID);
                        }
                    );
                }
            );
        });
    }
}
