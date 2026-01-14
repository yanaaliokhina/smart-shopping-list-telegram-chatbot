import { describe, jest } from "@jest/globals";
import { fakeItemRows } from "../__fixtures__";
import { ItemService } from "../item.service.js";

describe("ItemService", () => {
    let mockDb;
    let service;

    beforeEach(() => {
        mockDb = {
            all: jest.fn(),
            run: jest.fn()
        };
        service = new ItemService(mockDb);
    });

    describe("getItems()", () => {
        test("resolves rows from database", async () => {
            mockDb.all.mockImplementation((query, params, callback) => {
                callback(null, fakeItemRows);
            });

            await expect(service.getItems(10)).resolves.toEqual(fakeItemRows);

            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT * FROM items WHERE user_id = ?",
                [10],
                expect.any(Function)
            );
        });

        test("resolves empty array when no rows returned", async () => {
            mockDb.all.mockImplementation((query, params, callback) => {
                callback(null, null);
            });

            await expect(service.getItems(99)).resolves.toEqual([]);
        });

        test("rejects on database error", async () => {
            mockDb.all.mockImplementation((query, params, callback) => {
                callback(new Error("DB error"));
            });

            await expect(service.getItems(1)).rejects.toThrow("DB error");
        });
    });

    describe("getUnboughtItems()", () => {
        test("returns unbought items", async () => {
            mockDb.all.mockImplementation((query, params, callback) => {
                callback(null, fakeItemRows);
            });

            await expect(service.getUnboughtItems(5))
                .resolves.toEqual(fakeItemRows);

            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT * FROM items WHERE user_id = ? AND bought IS FALSE",
                [5],
                expect.any(Function)
            );
        });

        test("resolves empty array when no unbought items exist", async () => {
            mockDb.all.mockImplementation((query, params, callback) => {
                callback(null, []);
            });

            await expect(service.getUnboughtItems(5)).resolves.toEqual([]);
        });

        test("rejects on database error", async () => {
            mockDb.all.mockImplementation((query, params, callback) => {
                callback(new Error("DB error"));
            });

            await expect(service.getUnboughtItems(5))
                .rejects.toThrow("DB error");
        });
    });

    describe("addItem()", () => {
        test("resolves with inserted item id", async () => {
            mockDb.run.mockImplementation(function (query, params, callback) {
                callback.call({ lastID: 42 }, null);
            });

            await expect(service.addItem(10, "eggs"))
                .resolves.toEqual({ id: 42 });

            expect(mockDb.run).toHaveBeenCalledWith(
                "INSERT INTO items (user_id, name) VALUES (?, ?)",
                [10, "eggs"],
                expect.any(Function)
            );
        });

        test("rejects on insert error", async () => {
            mockDb.run.mockImplementation((query, params, callback) => {
                callback(new Error("Insert failed"));
            });

            await expect(service.addItem(10, "eggs"))
                .rejects.toThrow("Insert failed");
        });
    });

    describe("markBought()", () => {
        test("resolves with number of affected rows", async () => {
            mockDb.run.mockImplementation(function (query, params, callback) {
                callback.call({ changes: 1 }, null);
            });

            await expect(service.markBought(7)).resolves.toEqual({ changes: 1 });

            expect(mockDb.run).toHaveBeenCalledWith(
                "UPDATE items SET bought = TRUE WHERE id = ?",
                [7],
                expect.any(Function)
            );
        });

        test("rejects on update error", async () => {
            mockDb.run.mockImplementation((query, params, callback) => {
                callback(new Error("Update failed"));
            });

            await expect(service.markBought(7))
                .rejects.toThrow("Update failed");
        });
    });
});
