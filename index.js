import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import db from "./routes/db.js";
import authRouter from "./routes/auth.js";
import session from "express-session";
import passport from "passport";
import { router as geminiRouter, runAi } from "./routes/gemini.js";
import appRouter from "./routes/app.js";

//Creating a temp user
// async function getCurrentUser() {
//     const response = await db.query("SELECT * FROM users WHERE id=$1", [2]);
//     return response.rows[0];
// }
// async function getTodoList(currentUserId) {
//     const response = await db.query("SELECT * FROM tasks WHERE user_id=$1", [currentUserId]);
//     return response.rows;
// }

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
dotenv.config();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.authenticate('session'));

app.use("/", authRouter);
app.use("/", appRouter);

app.listen(PORT, () => {
    console.log(`Listening at Port ${PORT}`);
});

// let chatHistory = [];

// app.get("/", (req, res) => {
//     res.render("landing.ejs");
// });

// app.get("/sign-up", (req, res) => {
//     res.render("sign-up.ejs");
// });

// app.get("/app", (req, res) => {
//     res.render("index.ejs", {chatHistory: chatHistory});
// });

// app.get("/todo-list", async (req, res) => {
//     const currentUser = await getCurrentUser();
//     const todoList = await getTodoList(currentUser.id);
//     res.render("todo-list.ejs", {todoList: todoList});
// });

// app.post("/send", async (req, res) => {
//     const userInput = req.body.userInput.trim();
//     chatHistory.push({message: userInput, sentBy: "user"});
//     try {
//         const aiOutput = await runAi(userInput);
//         chatHistory.push({message: aiOutput, sentBy: "ai"});
//         console.log(chatHistory);
//         res.redirect("/app");
//     } catch(err) {
//         console.error("Something went wrong", err);
//         res.status(500).send("Oh Snap!");
//     }
// });

// app.post("/addTask", async (req, res) => {
//     const taskName = req.body.taskName;
//     const scheduledTime = req.body.scheduledTime;
//     const duration = req.body.duration;
//     console.log(taskName, scheduledTime, duration);
//     try {
//         const currentUser = await getCurrentUser();
//         await db.query("INSERT INTO tasks (user_id, task_name, scheduled_time, duration) VALUES ($1, $2, $3, $4)", 
//             [currentUser.id, taskName, scheduledTime, duration]);
//         res.redirect("/todo-list");
//     } catch(err) {
//         console.error("Error adding new task in DB", err);
//     }
// });
