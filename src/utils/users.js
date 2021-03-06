const users = [];

const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  // check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  // store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
// addUser({
//   id: 22,
//   username: "Andrew",
//   room: "test-room",
// });
// addUser({
//   id: 222,
//   username: "Adam",
//   room: "test-room",
// });
// console.log(users);
// const removedUser = removeUser(22)
// console.log(users);

const getUser = (id) => {
  return users.find((user) => {
    return user.id === id;
  });
};
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => {
    return user.room === room;
  });
};

// const userList = getUsersInRoom("test-room2");
// console.log(userList);
module.exports = {
  addUser,removeUser,getUser,getUsersInRoom
}