const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  room: { type: String, required: true },
  users: [
    {
      socketId: { type: String, required: true },
      username: { type: String, required: true }
    }
  ],

  messages: [
    {
      username: { type: String, required: true },
      text: { type: String, required: true }
    }
  ]
});

const Room = mongoose.model("rooms", roomSchema);

module.exports = Room;
