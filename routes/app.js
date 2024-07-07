import express from "express";
import db from "../routes/db.js";
import { router as geminiRouter,aiService } from "../routes/gemini.js";

const router = express.Router();

function isLoggedIn(req, res, next) {
    if(req.user) {
        next();
    } else {
        res.redirect("/");
    }
}

router.get("/", (req, res) => {
    res.render("landing.ejs");
});

router.get("/sign-up", (req, res) => {
    res.render("sign-up.ejs");
});

router.get("/app", isLoggedIn, async (req, res) => {
    const currentUserEmail = req.user.emails[0].value;
    const chatHistory = await getChatHistory(currentUserEmail);
    console.log(chatHistory[chatHistory.length-2].message);
    res.render("index.ejs", {chatHistory: chatHistory});
    // startAi(currentUserEmail);
    // aiService.start(currentUserEmail);
});

router.get("/todo-list", isLoggedIn, async (req, res) => {
    // const currentUser = await getCurrentUser();
    const currentUserEmail = req.user.emails[0].value;
    const todoList = await getTodoList(currentUserEmail);
    res.render("todo-list.ejs", {todoList: todoList});
});

router.post("/send", isLoggedIn, async (req, res) => {
    const userInput = req.body.userInput.trim();
    const currentUserEmail = req.user.emails[0].value;
    const currentUserId = await getCurrentUserId(currentUserEmail);
    console.log(currentUserId);
    await pushChatToDb(currentUserId, userInput, "user");
    try {
        const aiOutput = await aiService.run(currentUserEmail, userInput);
        await pushChatToDb(currentUserId, aiOutput, "ai");
        res.redirect("/app");
    } catch(err) {
        console.error("Something went wrong", err);
        res.status(500).send("Error in fetching ai output");
    }
});

router.post("/addTask", isLoggedIn, async (req, res) => {
    const taskName = req.body.taskName;
    const scheduledTime = req.body.scheduledTime;
    const duration = req.body.duration;
    const currentUserEmail = req.user.emails[0].value;
    const currentUserId = await getCurrentUserId(currentUserEmail);
    console.log(taskName, scheduledTime, duration);
    try {
        await db.query("INSERT INTO tasks (user_id, task_name, scheduled_time, duration) VALUES ($1, $2, $3, $4)", 
            [currentUserId, taskName, scheduledTime, duration]);
        res.redirect("/todo-list");
    } catch(err) {
        console.error("Error adding new task in DB", err);
    }
});

//database queries
async function getCurrentUserId(currentUserEmail) {
    const response = await db.query("SELECT id FROM users WHERE email=$1", [currentUserEmail]);
    return response.rows[0].id;
}
async function getTodoList(currentUserEmail) {
    //try-catch block for recieveing todo list
    try {
        const response = await db.query(`SELECT *
            FROM tasks
            INNER JOIN users ON tasks.user_id = users.id
            WHERE users.email=$1
            ORDER BY scheduled_time ASC;`, [currentUserEmail]);
        return response.rows;
    } catch(err) {
        console.error("Error retreieving ToDo List", err);
    }  
}
async function getChatHistory(currentUserEmail) {
    //try-catch block for getting chat history
    try {
        const response = await db.query(`SELECT *
                                            FROM chats
                                            INNER JOIN users ON chats.user_id = users.id
                                            WHERE users.email=$1
                                            ORDER BY chats.created_at ASC;`, [currentUserEmail]);
        return response.rows;
    } catch(err) {
        console.error("Error retrieveing chat history", err);
    }
}

async function pushChatToDb(currentUserId, message, sent_by) {
    //try-catch to push chat to db
    try {
        await db.query(`INSERT INTO chats (user_id, message, sent_by) VALUES ($1, $2, $3)`, [currentUserId, message, sent_by]);
    } catch(err) {
        console.error("Error pushing msg to db", err);
    }
}



export default router;