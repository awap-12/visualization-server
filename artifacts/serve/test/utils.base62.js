const base62 = require("../utils/base62");
const assert = require("node:assert");

describe("base62 util test", () => {
    it("should return 62 random char", () => {
        assert.strictEqual(typeof base62(1), "string")
        assert.strictEqual(base62(62)?.length, 62);
    });
    it("should be random", () => {
        let a = base62(12);
        let b = base62(12);
        assert.notStrictEqual(a, b);
    });
});
