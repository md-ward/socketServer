import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { PeerServer } from "peer";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["https://qvpbcngg-5173.inc1.devtunnels.ms/", "*"] },
});

app.use(cors());
app.use(express.static("public"));

PeerServer({
  path: "/peerjs",
  port: 3001,
  corsOptions: {
    origin: ["*",'https://qvpbcngg-5173.inc1.devtunnels.ms/'],
  },
});

interface UserStatus {
  username?: string;
  id: string;
}

const users: { [key: string]: UserStatus } = {};

io.on("connection", (socket) => {
  socket.on("userInformation", (userStatus) => {
    console.log("User connected:", [socket.id, userStatus]);
    users[userStatus.username] = { ...userStatus };
    io.emit("usersUpdate", users);
  });

  socket.on("callUser", (data) => {
    console.log(`User ${data.from} is calling ${data.userToCall}`);
    io.to(data.userToCall).emit("incomingCall", {
      signal: data.signalData,
      from: data.from,
      name: users[socket.id]?.username || "Unknown",
    });
  });

  socket.on("acceptCall", (data) => {
    console.log(`User ${socket.id} accepted the call from ${data.to}`);
    io.to(data.to).emit("callAccepted", { signal: data.signal });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("usersUpdate", users);
  });
});

server.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
