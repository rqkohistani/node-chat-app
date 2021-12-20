const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUsersInRoom,
  getUser,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let countUsers = 0;
// server(emit)-> client (receive) - countUpdated
// client (emit)-> server (receive) - increment
io.on("connection", (socket) => {
  console.log(`New WebSocket connection: ${countUsers++} `);
  // emit sends an event to the client and the client should listen to message
  // socket.emit("message", generateMessage("Welcome!"));
  // // it broadcast it to every body except itself. new user
  // // socket.broadcast.emit("message", "a new user connected");
  // socket.broadcast.emit("message", generateMessage("A new user has joined"));

  socket.on("join", ({ username, room }, callback) => {
    // addUser returns an object either with error or the user
    // addUser({ id: socket.id, username, room })
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      // in case of error
      return callback(error);
    }
    socket.join(user.room);
    //socket.emit =>sends an event to a specific client.
    // io.emit => sends an event to every connected client
    // socket.broadcast.emit => sends an event to every connected client except for itself
    //io.to.emit => emits an event to everybody in a specific room
    // socket.broadcast.to.emit => sends an event to every connected client but it's limiting it to a specific ,chat room
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    // it broadcast it to every body except itself. new user
    // socket.broadcast.emit("message", "a new user connected");
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined!!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users:getUsersInRoom(user.room)
    })
    // in case of no error
    callback();
  });

  // ***** server (emit) -> client (receive) --acknowledgement-->server
  // socket.on("sendMessage", (message) => {
  socket.on("sendMessage", (message, callbackAcknowledgment) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callbackAcknowledgment("Profanity is now allowed");
    }

    //io.emits an event to every single connection
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callbackAcknowledgment();
  });

  // for disconnected io, you use socket.io inside the io.on(connection callback). we only to use the listener for the built-in event disconnect
  // this code will run whenever a client gets disconnected. no need for broadcasting.
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
       io.to(user.room).emit("roomData", {
         room: user.room,
         users: getUsersInRoom(user.room),
       });
    }
    // io.emit("message", generateMessage("A user has left"));
    // // io.emit(
    // //   "message",
    // //   `A user has left: Active users: ${countUsers} ` + --countUsers
    // // );
  });

  // listening of location
  socket.on("sendLocation", (coords, callbackAcknowledgment) => {
    const user = getUser(socket.id);
    //  socket.broadcast.emit("message", `Location: ${coords.latitude}, Longitude: ${coords.longitude}`);
    // google latitude and longitude https//google.com/maps?q=0,0
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
      // `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    );
    callbackAcknowledgment();
  });
});
server.listen(port, () => {
  console.log(`Server is up on port  ${port}`);
});
