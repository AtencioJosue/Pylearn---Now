const server = require("../artifacts/api-server/dist/index.cjs");

module.exports = server.default || server;
