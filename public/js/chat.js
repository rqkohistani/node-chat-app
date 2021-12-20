console.log("Hello from chat js");
const socket = io();

// Elements
const sendMessage = document.querySelector("#message-form");
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages"); //rendering the template

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// This line code auto scroll the messages all the way the bottom
// however, if someone send a message if you are on the top then it takes back the bottom
// const autoscroll = () => {
//   $messages.scrollTop=$messages.scrollHeight
// }

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;
  // Height of the new message
  const newMessageSyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageSyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  // visible height
  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;
  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Listening on message incoming from the server
socket.on("message", (msg) => {
  console.log(msg);
  // html stores the final html to render it on the browser
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (msg) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: msg.username,
    url: msg.url,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

sendMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  // disable button
  $messageFormButton.setAttribute("disabled", "disabled");
  // const message=document.querySelector('message').value
  //alternative way
  const message = e.target.elements.message.value;
  // socket.emit("sendMessage", message); // the server knows the current count
  //** client (emit) -> server (receive) --acknowledgement-->client
  // socket.emit("sendMessage", message);
  socket.emit("sendMessage", message, (error) => {
    // enable the button after sending the acknowledgment
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormButton.focus();

    if (error) {
      return console.log(error);
    }
    // console.log("The message was delivered");
    console.log("The message was delivered!");
  });
});
// disabling the send location button
$sendLocationButton.addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    // enabling the send location button
    // console.log(position.coords.latitude);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared");
      }
    );
  });
});
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    // directing the user back to the home page
    location.href = "/";
  }
});
