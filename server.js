const express = require('express')
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server);
const { v4: uuid } = require("uuid");
const port = process.env.PORT || 3000;

app.set("view-engine", "ejs")
app.use(express.static('public'))
app.use("/room/:id/", express.static('public'))

app.get("/", (req, res) => {
    res.render("index.ejs")
});

app.get("/room", (req, res) => {
    res.redirect(`/room/${uuid()}`);
});

app.get("/room/:id", (req, res) => {
    res.render("room.ejs", { userId: uuid(), roomId: req.params.id });
})

io.on("connection", socket => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("new-member", userId);
    })
    socket.on("emit-message", (roomId, textObj) => {
        socket.to(roomId).broadcast.emit("new-message", textObj);
    });

    socket.on("emit-typing", (roomId, userId, displayName) => {
        socket.to(roomId).broadcast.emit("user-typing", userId, displayName)
    });
})

server.listen(port)