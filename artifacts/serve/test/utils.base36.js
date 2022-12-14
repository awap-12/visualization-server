const base36 = require("../utils/base36");
const assert = require("node:assert");

describe("base36 util test", () => {
    it("should return 36 random char", () => {
        assert.strictEqual(typeof base36(1), "string")
        assert.strictEqual(base36(36)?.length, 36);
    });
    it("should be random", () => {
        let a = base36(12);
        let b = base36(12);
        assert.notStrictEqual(a, b);
    });
});
