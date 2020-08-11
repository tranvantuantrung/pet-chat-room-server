const Room = require("../models/room.model");
let users = [];

const addUser = async ({ id, name, room }) => {
  let roomMatched = await Room.findOne({ room });

  users = roomMatched.users;

  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existUser = users.find((user) => user.username === name);

  if (existUser) {
    return { err: "Oops, Username already exists, please try again" };
  }

  const user = { socketId: id, username: name };

  users.push(user);

  roomMatched.save();

  const newUser = {
    ...user,
    room
  };

  return { newUser };
};

const removeUser = async ({ id, room }) => {
  let roomMatched = await Room.findOne({ room });

  if (roomMatched) {
    users = roomMatched.users;

    const index = users.findIndex((user) => user.socketId === id);

    if (index !== -1) {
      roomMatched.save();
      return users.splice(index, 1)[0];
    }
  }
};

const getUser = (id) => users.find((user) => user.socketId === id);

const getUsersInRoom = () => users;

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
