const filter = require("../utils/filter");
const assert = require("node:assert");

function notEmpty(value) {
    if (Array.isArray(value))
        return value.length > 0;
    if (value != null && typeof value === "object") {
        for (const valueKey in value) return true;
        return false;
    }
    if (typeof value === "string")
        return value.trim().length > 0

    return value != null;
}

async function notEmptyAsync(value) {
    if (Array.isArray(value))
        return value.length > 0;
    if (value != null && typeof value === "object") {
        for (const valueKey in value) return true;
        return false;
    }
    if (typeof value === "string")
        return value.trim().length > 0

    return value != null;
}

describe("filter util test", () => {
    describe("primitive input", () => {
        it("should return the original input", () => {
            assert.strictEqual(filter.filterCollection(undefined, notEmpty), undefined);

            assert.strictEqual(filter.filterCollection(null, notEmpty), null);

            assert.strictEqual(filter.filterCollection("  ", notEmpty), "  ");

            assert.strictEqual(filter.filterCollection('', notEmpty), '');
        });
        it("should return the original input with async operation", async () => {
            assert.strictEqual(await filter.filterCollection(undefined, notEmptyAsync), undefined);

            assert.strictEqual(await filter.filterCollection(null, notEmptyAsync), null);

            assert.strictEqual(await filter.filterCollection("  ", notEmptyAsync), "  ");

            assert.strictEqual(await filter.filterCollection('', notEmptyAsync), '');
        });
    });
    describe("object input", () => {
        it("should filter entries recursively", () => {
            assert.deepStrictEqual(filter.filterCollection({ foo: null }, notEmpty), {});

            assert.deepStrictEqual(filter.filterCollection({ foo: undefined }, notEmpty), {});

            assert.deepStrictEqual(filter.filterCollection({ foo: { bar: null } }, notEmpty), {});

            assert.deepStrictEqual(filter.filterCollection({ foo: { bar: undefined } }, notEmpty), {});

            assert.deepStrictEqual(filter.filterCollection({ foo: { bar: null, baz: 1, bay: "  " } }, notEmpty), { foo: { baz: 1 }});
        });
        it("should filter entries recursively with async operation", async () => {
            assert.deepStrictEqual(await filter.filterCollection({ foo: null }, notEmptyAsync), {});

            assert.deepStrictEqual(await filter.filterCollection({ foo: undefined }, notEmptyAsync), {});

            assert.deepStrictEqual(await filter.filterCollection({ foo: { bar: null } }, notEmptyAsync), {});

            assert.deepStrictEqual(await filter.filterCollection({ foo: { bar: undefined } }, notEmptyAsync), {});

            assert.deepStrictEqual(await filter.filterCollection({ foo: { bar: null, baz: 1, bay: "  " } }, notEmptyAsync), { foo: { baz: 1 }});
        });
    });
    describe("array input", () => {
        it("should filter entries recursively", () => {
            assert.deepStrictEqual(filter.filterCollection([null], notEmpty), []);

            assert.deepStrictEqual(filter.filterCollection([undefined], notEmpty), []);

            assert.deepStrictEqual(filter.filterCollection([1, ["foo", '', null, "  "]], notEmpty), [1, ["foo"]]);
        });
        it("should filter entries recursively with async operation", async () => {
            assert.deepStrictEqual(await filter.filterCollection([null], notEmptyAsync), []);

            assert.deepStrictEqual(await filter.filterCollection([undefined], notEmptyAsync), []);

            assert.deepStrictEqual(await filter.filterCollection([1, ["foo", '', null, "  "]], notEmptyAsync), [1, ["foo"]]);
        });
    });
    describe("mixed & complex array/object input", () => {
        it("should filter array/objects recursively", () => {
            const original = {
                something: [
                    {
                        colors: ["red", "green", ''],
                        cars: { audi: "nice", vw: "good", aston: '' }
                    },
                    undefined,
                    ''
                ],
                foo: "bar"
            };
            const filtered = {
                something: [
                    {
                        colors: ["red", "green"],
                        cars: { audi:"nice", vw: "good" }
                    }
                ],
                foo: "bar"
            };

            assert.deepStrictEqual(filter.filterCollection(original, notEmpty), filtered);
        });
        it("should filter array/objects recursively with async operation", async () => {
            const original = {
                something: [
                    {
                        colors: ["red", "green", ''],
                        cars: { audi: "nice", vw: "good", aston: '' }
                    },
                    undefined,
                    ''
                ],
                foo: "bar"
            };
            const filtered = {
                something: [
                    {
                        colors: ["red", "green"],
                        cars: { audi:"nice", vw: "good" }
                    }
                ],
                foo: "bar"
            };

            assert.deepStrictEqual(await filter.filterCollection(original, notEmptyAsync), filtered);
        });
    });
});
