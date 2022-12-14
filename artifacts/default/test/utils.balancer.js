const Balancer = require("../utils/balancer");
const assert = require("chai").assert;

describe("balancer util test", () => {
    it("should ", () => {
        const balancer = new Balancer(10);
        const bins = new Array(10);

        // initializes the elements of the array to zero.
        for (let i = 0; i < bins.length; i++) bins[i] = 0;

        // 10K requests.
        for (let i = 0; i < 1e4; i++) bins[balancer.pick()]++;

        for (const bin of bins) {
            assert.closeTo(bin / 1e4, 0.1, 3);
        }
    });
});
