import express from "express";
import db from "../routes/db.js";
import { router as geminiRouter,aiService } from "../routes/gemini.js";
import { taskScheduler } from "../routes/task-scheduler.js";

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
    const currentUserId = await getCurrentUserId(currentUserEmail);
    const chatHistory = await getChatHistory(currentUserEmail);
    const pic = await getProfilePic(currentUserId);
    if(chatHistory.length == 0) {
        await sendWelcomeMsg(currentUserEmail, currentUserId);
        const chatHistory = await getChatHistory(currentUserEmail);
        res.render("index.ejs", {chatHistory: chatHistory, currentUserId: currentUserId, pic: pic});
    } else {
        res.render("index.ejs", {chatHistory: chatHistory, currentUserId: currentUserId, pic: pic});
    }
    
    // startAi(currentUserEmail);
    // aiService.start(currentUserEmail);
});

router.get("/todo-list", isLoggedIn, async (req, res) => {
    // const currentUser = await getCurrentUser();
    const currentUserEmail = req.user.emails[0].value;
    const currentUserId = await getCurrentUserId(currentUserEmail);
    const pic = await getProfilePic(currentUserId);
    const todoList = await getTodoList(currentUserId);
    res.render("todo-list.ejs", {todoList: todoList, currentUserId: currentUserId, pic: pic});
});

router.post("/send", isLoggedIn, async (req, res) => {
    // const userInput = req.body.userInput.trim();
    const userInput = req.body.userInput.trim();
    console.log(userInput);
    const currentUserEmail = req.user.emails[0].value;
    const currentUserId = await getCurrentUserId(currentUserEmail);
    console.log(currentUserId);
    await pushChatToDb(currentUserId, userInput, "user");
    try {
        const aiOutput = await aiService.run(currentUserEmail, userInput);
        await pushChatToDb(currentUserId, aiOutput, "ai");
        // res.redirect("/app");
        res.json({ response: aiOutput });
    } catch(err) {
        console.error("Something went wrong", err);
        res.status(500).send("Error in fetching ai output");
    }
});

router.post("/addTask", isLoggedIn, async (req, res) => {
    const taskName = req.body.taskName;
    const scheduledTime = req.body.scheduledTime;
    const currentDateString = req.body.currentDate;
    const duration = req.body.duration;
    const clientTimezone = req.body.clientTimezone;
    const currentUserEmail = req.user.emails[0].value;
    const currentUserId = await getCurrentUserId(currentUserEmail);

    console.log(clientTimezone);

    //Sending data to task-scheduler.js
    taskScheduler(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail, clientTimezone);
    console.log(taskName, scheduledTime, duration);
    try {
        const response = await db.query("INSERT INTO tasks (user_id, task_name, scheduled_time, duration) VALUES ($1, $2, $3, $4) RETURNING id", 
            [currentUserId, taskName, scheduledTime, duration]);
        const taskId = response.rows[0].id;
        res.json({ response: taskId });
        // res.redirect("/todo-list");
    } catch(err) {
        console.error("Error adding new task in DB", err);
    }
});

router.post('/delete-task', isLoggedIn, async (req, res) => {
    const taskId = req.body.taskId;
    try {
        await db.query('DELETE FROM tasks WHERE id=$1', [taskId]);
        console.log(`Task with id ${taskId} is deleted`);
    } catch(err) {
        console.error('Error deleting task', err);
    }
})

//database queries
async function getCurrentUserId(currentUserEmail) {
    const response = await db.query("SELECT id FROM users WHERE email=$1", [currentUserEmail]);
    return response.rows[0].id;
}
async function getTodoList(currentUserId) {
    //try-catch block for recieveing todo list
    try {
        const response = await db.query(`SELECT *
            FROM tasks
            WHERE tasks.user_id=$1`, [currentUserId]);
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

//Get profile pic from DB
async function getProfilePic(currentUserId) {
    try {
        const response = await db.query(`SELECT photo_link FROM users WHERE id=$1`, [currentUserId]);
        return response.rows[0].photo_link;
    } catch(err) {
        console.error("Error fetching pic from db", err);
    } 
}

//Sending welcome message for new user
async function sendWelcomeMsg(currentUserEmail, currentUserId) {
    const prompt = `Ok great! So a new user has signed in. Send them a Welcome Message 
    and a Thank You note from the developer of the app - Samarth, for choosing this app.
    After that convey some basics that they need to know to use this app in best way.
    1. They can discuss their problems with you and seek support.
    2. Your task is to keep them accountable, so tell them that they can put their tasks in 
    the 'Tasks' tab and you will keep them accountable.
    3. Ask them to enable the notification by clicking the button at top.
    If this is not enabled, you won't be able to send them reminders.
    Tell these points in your own language. You can also add some more points to use this app in best way.
    From here on, you'll be talking to the user. All the best! Start with a welcome now`;
    const aiOutput = await aiService.run(currentUserEmail, prompt);
    await pushChatToDb(currentUserId, aiOutput, "ai"); 
}




export default router;