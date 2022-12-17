const filter = require("../utils/filter");
const assert = require("node:assert");

describe("filter util test", () => {
    it("should filter all undefined from array", () => {
        assert.deepStrictEqual(filter.typeFilter(["foo", undefined]), ["foo"])
    });
    it("should filter all undefined from object", () => {
        assert.deepStrictEqual(filter.typeFilter({ foo: "foo", bar: undefined }), { foo: "foo" });
    });
});
