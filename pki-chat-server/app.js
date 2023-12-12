import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const userList = [];
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  console.log(`${socket.id} is connected`);

  socket.on("sendMessage", ({ text, sender }) => {
    socket.broadcast.emit("receive_message", { text: text, sender: sender });
  });

  socket.on("disconnect", async () => {
    console.log(`${socket.id} is disconnected`);
    const indexToDelete = userList.findIndex(
      (data) => data.socketid == socket.id
    );
    if (indexToDelete !== -1) userList.splice(indexToDelete, 1);
    io.emit("userList", userList);
  });

  socket.on("login", (fromClient) => {
    const userName = fromClient.userName;

    fetch("http://localhost:3000/user/publicKey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: userName,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        userList.push({ userdata: data, socketid: socket.id });
        io.emit("userList", userList);
      });
  });
});

server.listen(3001, () => {
  console.log("server running at http://localhost:3001");
});
