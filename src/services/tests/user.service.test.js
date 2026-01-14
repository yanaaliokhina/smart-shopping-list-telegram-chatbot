import { describe, jest } from "@jest/globals";
import { UserService } from "../user.service.js";

describe("UserService", () => {
    let mockDb;
    let service;

    beforeEach(() => {
        mockDb = {
            get: jest.fn(),
            run: jest.fn()
        };
        service = new UserService(mockDb);
    });

    describe("getOrCreateUser()", () => {
        test("returns existing user id if user exists", async () => {
            mockDb.get.mockImplementation((query, params, callback) => {
                callback(null, { id: 5, telegram_id: 123 });
            });

            const result = await service.getOrCreateUser(123);

            expect(mockDb.get).toHaveBeenCalledTimes(1);
            expect(mockDb.get).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE telegram_id = ?",
                [123],
                expect.any(Function)
            );
            expect(mockDb.run).not.toHaveBeenCalled();
            expect(result).toBe(5);
        });

        test("creates user and returns new id if user does not exist", async () => {
            mockDb.get.mockImplementation((query, params, callback) => {
                callback(null, null);
            });

            mockDb.run.mockImplementation((query, params, callback) => {
                callback.call({ lastID: 42 }, null);
            });

            const result = await service.getOrCreateUser(999);

            expect(mockDb.get).toHaveBeenCalledTimes(1);
            expect(mockDb.run).toHaveBeenCalledTimes(1);

            expect(mockDb.run).toHaveBeenCalledWith(
                "INSERT INTO users (telegram_id) VALUES (?)",
                [999],
                expect.any(Function)
            );

            expect(result).toBe(42);
        });

        test("rejects if db.get returns error", async () => {
            mockDb.get.mockImplementation((query, params, callback) => {
                callback(new Error("DB error"), null);
            });

            await expect(service.getOrCreateUser(555))
                .rejects.toThrow("DB error");

            expect(mockDb.run).not.toHaveBeenCalled();
        });

    });
});
