const Room = require("../models/room.model");

let messages = [];

const getMessages = async ({ room }) => {
  let roomMatched = await Room.findOne({ room });

  messages = roomMatched.messages;

  return messages;
};

const updateMessages = async ({ room, message }) => {
  const { username, text } = message;
  let roomMatched = await Room.findOne({ room });

  if (roomMatched) {
    messages = roomMatched.messages;

    messages.push({ username, text });

    roomMatched.save();

    return messages;
  }
};

module.exports = { updateMessages, getMessages };
