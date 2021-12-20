console.log("Hello from chat js");
const socket = io();
// io() allows us to send and recieve events on both sides server and client. and to connect server. this is all we need to put in our chat script.

// receiving an event from the server with the specific event name
socket.on("countUpdate", (count) => {
  console.log("The count has been updated", count);
  //  socket.emit("increment");
});

const increment = document.querySelector("#increment");
increment.addEventListener("click", () => {
  console.log("Clicked");
  // emit an event from client to the server
  socket.emit("increment"); // the server knows the current count
});
