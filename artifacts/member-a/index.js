const express = require("express");
const cluster = require("node:cluster");

module.exports = port => {

    if (cluster.isSpawn) {
        const app = express();

        app.use("/", async (req, res) => {
            const { default: fetch } = await import("node-fetch");
            const result = await fetch("http://localhost:3000/api/memberB", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: "DATA-FROM-A" })
            });
            const text = await result.text();
            res.send(text);
        });

        app.listen(port);
    }
}
