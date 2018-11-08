require("./src/intervals");
const server = require("./src/server");
const panel = require("./src/panel/server");

server.start();
panel.start();