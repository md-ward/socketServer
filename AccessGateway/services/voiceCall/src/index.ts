import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { PeerServer } from "peer";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.static("public"));

const peerServer = PeerServer({
  path: "/peerjs",
  port: 3001,
});
// app.use( peerServer);

interface UserStatus {
  username?: string;
  id: string;
}

const users: { [key: string]: UserStatus } = {};

io.on("connection", (socket) => {
  
  socket.on("userInformation", (userStatus) => {
    console.log("User connected:", socket.id); 
    console.log(userStatus);

    users[socket.id] = { ...userStatus, id: socket.id };
    io.emit("usersUpdate", users);
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("incomingCall", {
      signal: data.signalData,
      from: data.from,
      name: users[socket.id]?.username || "Unknown",
    });
  });

  socket.on("acceptCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("usersUpdate", users);
  });
});

server.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);

// // Import dependencies
// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const cors = require('cors');

// // Create the app and server
// const app = express();
// app.use(cors({
//     origin: '*' // Allow only the client with entering the url of client
// }));
// const server = http.createServer(app);
// const io = socketIO(server);

// app.get("/", (req, res) => {
//     res.send("Server is running.");
// });

// // Handle new socket connections
// io.on('connection', (socket) => {

//     // Handle incoming audio stream
//     socket.on('audioStream', (audioData) => {
//         socket.broadcast.emit('audioStream', audioData);
//     });

//     socket.on('disconnect', () => {
//     });
// });

// // Start the server
// const port = process.env.PORT || 3000;
// server.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

//
