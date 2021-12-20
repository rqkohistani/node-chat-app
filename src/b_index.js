const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

// create new instances of
const app = express();
const server = http.createServer(app);
const io = socketio(server);
//when require the library, we get a function back and we call that function to actually configure socketio to a given server and we pass to that server

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let count = 0;
let countUsers = 1;
// server(emit)-> client (receive) - countUpdated
// client (emit)-> server (receive) - increment

// sending the count back to the client that just opened the connection
// (socket) is an object and it contains information about new connection we use methods on socket to communicate with that specific client: e.g if there are 5 clients connecting to the server this function is going to run five different times. One time for each new connection
io.on("connection", (socket) => {
  console.log(`New WebSocket connection: ${countUsers++} `);
  // emit sends an event to the client and the client should listen to message
  socket.emit("message", "Welcome! ");

socket.on("sendMessage", (message) => {
  io.emit("message", message); //io.emits an event to every single connection
});




});
server.listen(port, () => {
  console.log(`Server is up on port  ${port}`);
});
