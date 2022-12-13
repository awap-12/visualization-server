module.exports = {
    "serve": {
        prefix: "default",
        maxForks: "2",
        port: 8686
    },
    "member-a": {
        prefix: "/api/memberA",
        maxForks: "1",
        port: 8687
    },
    "member-b": {
        prefix: "/api/memberB",
        maxForks: "1",
        port: 8688
    },
    "user": {
        prefix: "/api/user",
        maxForks: "1",
        port: 8689
    }
};
