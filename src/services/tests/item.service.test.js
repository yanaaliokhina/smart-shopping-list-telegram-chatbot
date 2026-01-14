import { jest } from "@jest/globals";
import { fakeItemRows } from "../__fixtures__";
import { ItemService } from "../item.service.js";

describe("ItemService", () => {
    let mockDb;
    let service;

    beforeEach(() => {
        mockDb = {
            all: jest.fn()
        };
        service = new ItemService(mockDb);
    });

    describe("*getItems", () => {
        test("getItems returns rows from database", async () => {
            mockDb.all.mockImplementation((query, params, callback) => {
                callback(null, fakeItemRows);
            });

            const result = await service.getItems(10);

            expect(mockDb.all).toHaveBeenCalledTimes(1);
            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT * FROM items WHERE user_id = ?",
                [10],
                expect.any(Function)
            );
            expect(result).toEqual(fakeItemRows);
        });

        test("getItems resolves even if db returns empty result", async () => {
            mockDb.all.mockImplementation((query, params, callback) => {
                callback(null, []);
            });

            const result = await service.getItems(99);

            expect(result).toEqual([]);
        });

        test("getItems ignores db error and resolves rows", async () => {
            const fakeRows = [fakeItemRows[0]];

            mockDb.all.mockImplementation((query, params, callback) => {
                callback(new Error("DB error"), fakeRows);
            });

            const result = await service.getItems(1);

            expect(result).toEqual(fakeRows);
        });
    });
});
