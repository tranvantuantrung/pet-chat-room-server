require("dotenv").config();

const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const {
  getMessages,
  updateMessages
} = require("./controllers/messages.controller");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./controllers/user.controller");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 8080;

app.use(cors());

//socket handle
io.on("connection", (socket) => {
  let userRoom;

  socket.on("join", async ({ name, room }, cb) => {
    userRoom = room;

    const { err, newUser } = await addUser({ id: socket.id, name, room });
    const messages = await getMessages({ room });

    if (err) return cb(err);

    socket.join(newUser.room);

    socket.emit("messages", {
      messages
    });

    socket.emit("message", {
      username: "admin",
      text: `Hi ${newUser.username}, welcome to room ${newUser.room} :">`
    });

    socket.broadcast.to(newUser.room).emit("message", {
      username: "admin",
      text: `${newUser.username} has joined!`
    });

    // update messages db
    updateMessages({
      room: newUser.room,
      message: { username: "admin", text: `${newUser.username} has joined!` }
    });

    io.to(newUser.room).emit("roomData", {
      room: newUser.room,
      users: getUsersInRoom()
    });

    cb();
  });

  socket.on("sendMessage", ({ room, message }, cb) => {
    const user = getUser(socket.id);

    io.to(room).emit("message", { username: user.username, text: message });

    updateMessages({
      room,
      message: { username: user.username, text: message }
    });

    cb();
  });

  socket.on("leaveRoom", async ({ room }) => {
    const user = await removeUser({ id: socket.id, room });

    if (user) {
      io.to(room).emit("message", {
        username: "admin",
        text: `${user.username} has left :(`
      });

      updateMessages({
        room,
        message: { username: "admin", text: `${user.username} has left :(` }
      });

      io.to(room).emit("roomData", {
        room: room,
        users: getUsersInRoom()
      });
    }
  });

  socket.on("disconnect", async () => {
    const user = await removeUser({ id: socket.id, room: userRoom });

    if (user) {
      io.to(userRoom).emit("message", {
        username: "admin",
        text: `${user.username} has left :(`
      });

      updateMessages({
        userRoom,
        message: { username: "admin", text: `${user.username} has left :(` }
      });

      io.to(userRoom).emit("roomData", {
        room: userRoom,
        users: getUsersInRoom()
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("Server is running...");
});

server.listen(PORT, () => {
  console.log(`Server has started on ${PORT}`);
});
