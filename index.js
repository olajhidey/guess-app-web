require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const path = require("path");

const port = process.env.PORT || 3000;
const app = express()
app.use(express.static(path.join(__dirname, 'www')))
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("message", (message) => {
        console.log("Message received:", message);
        io.emit("receiveMessage", message);
    });

    socket.on("joined", (message) => {
        const {name, gameCode} = JSON.parse(message);
        console.log("Client joined room:", message);
        socket.join(gameCode);
        io.to(gameCode).emit("lobby", {name, gameCode});
    });

    socket.on("start game", async (message) => {
        console.log("Game started:", message);
        const {name, gameCode, topic, isHost, token} = JSON.parse(message);
          const questions = await fetchQuestion(topic, token)
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            io.to(gameCode).emit("question", question);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        }
        io.to(gameCode).emit("end", "Game Over");
    })

    socket.on("add guest", (message) => {
        const {name, gameCode, topic, isHost, token} = JSON.parse(message);
        console.log("Client added guest:", message);
        io.to(gameCode).emit("guest added", {name, gameCode});
    });

    socket.on("score", (message) => {
        // const {name, gameCode, score} = JSON.parse(message);
        console.log("Score received:", message);
        // io.to(gameCode).emit("score", {name, score});
    })

    socket.on("leave", (message) => {
        const {name, gameCode} = JSON.parse(message);
        console.log(`${name} left the room`);
        socket.leave(gameCode);
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
})

async function fetchQuestion(id, token) {
    try {
        const url = `${process.env.ADMIN_URL}/api/question/list/` + id;
        const response = await axios.get(url, {
            'headers': {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'www', 'index.html'));
  });

app.post("/start", (req, res) => {
   const { room, playerName } = req.body;
    console.log("Starting game with room:", room, "and player name:", playerName);
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})