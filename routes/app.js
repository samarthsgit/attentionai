import express from "express";
import db from "../routes/db.js";
import { router as geminiRouter, runAi } from "../routes/gemini.js";

const router = express.Router()

let chatHistory = [];

router.get("/", (req, res) => {
    res.render("landing.ejs");
});

router.get("/sign-up", (req, res) => {
    res.render("sign-up.ejs");
});

router.get("/app", (req, res) => {
    res.render("index.ejs", {chatHistory: chatHistory});
});

router.get("/todo-list", async (req, res) => {
    const currentUser = await getCurrentUser();
    const todoList = await getTodoList(currentUser.id);
    res.render("todo-list.ejs", {todoList: todoList});
});

router.post("/send", async (req, res) => {
    const userInput = req.body.userInput.trim();
    chatHistory.push({message: userInput, sentBy: "user"});
    try {
        const aiOutput = await runAi(userInput);
        chatHistory.push({message: aiOutput, sentBy: "ai"});
        console.log(chatHistory);
        res.redirect("/app");
    } catch(err) {
        console.error("Something went wrong", err);
        res.status(500).send("Oh Snap!");
    }
});

router.post("/addTask", async (req, res) => {
    const taskName = req.body.taskName;
    const scheduledTime = req.body.scheduledTime;
    const duration = req.body.duration;
    console.log(taskName, scheduledTime, duration);
    try {
        const currentUser = await getCurrentUser();
        await db.query("INSERT INTO tasks (user_id, task_name, scheduled_time, duration) VALUES ($1, $2, $3, $4)", 
            [currentUser.id, taskName, scheduledTime, duration]);
        res.redirect("/todo-list");
    } catch(err) {
        console.error("Error adding new task in DB", err);
    }
});

//database queries
async function getCurrentUser() {
    const response = await db.query("SELECT * FROM users WHERE id=$1", [2]);
    return response.rows[0];
}
async function getTodoList(currentUserId) {
    const response = await db.query("SELECT * FROM tasks WHERE user_id=$1", [currentUserId]);
    return response.rows;
}



export default router;