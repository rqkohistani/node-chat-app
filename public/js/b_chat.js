console.log("Hello from chat js");
const socket = io();
// io() allows us to send and recieve events on both sides server and client. and to connect server. this is all we need to put in our chat script.

// receiving an event from the server with the specific event name
socket.on("message", (message) => {
  console.log(message);
});
const sendMessage = document.querySelector("#message-form");
sendMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  // const message=document.querySelector('message').value
  const message = e.target.elements.message.value; //alternative way
  // emit an event from client to the server
  socket.emit("sendMessage", message); // the server knows the current count
  message = document.querySelector("msg").value = "";
});
