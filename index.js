import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import db from "./routes/db.js";
import authRouter from "./routes/auth.js";
import session from "express-session";
import passport from "passport";
// import { router as geminiRouter, runAi } from "./routes/gemini.js";
import appRouter from "./routes/app.js";
import { Server } from 'socket.io';
import swRouter from "./routes/handle-sw.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());
dotenv.config();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.authenticate('session'));

app.use("/", authRouter);
app.use("/", appRouter);
app.use("/", swRouter);

const server = app.listen(PORT, () => {
    console.log(`Listening at Port ${PORT}`);
});

//Socket.io
const io = new Server(server);

io.on('connection', (socket) => {
  console.log("User is connected");

  socket.on('disconnect', () => {
    console.log("User disconnected");
  });
  //Testing
  socket.on('storeClientInfo', (data) => {
    console.log(`Data got from index.ejs ${data.userId}`);
    socket.userId = data.userId;
    console.log(`Socket user id is ${socket.userId}`);
    console.log(typeof socket.userId);
  });
  //Adding this socket to a room
  socket.join("redirect-room");
});


export { io }

