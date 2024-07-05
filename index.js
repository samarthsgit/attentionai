import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
dotenv.config();

app.listen(PORT, () => {
    console.log(`Listening at Port ${PORT}`);
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

let instructionsToAi = `
Hii! This is the message from the admin to you. I am using you for my app AttentionAI. It is designed for people with ADHD to keep them accountable and provide emotional support. Below are more details about your role.

Role: ADHD Accountability Coach

Purpose:
- To help users with ADHD manage their daily tasks and responsibilities.
- To provide reminders, encouragement, and helpful strategies for staying focused.
- To offer a supportive and non-judgmental space for users to discuss their challenges and progress.

Behavior:
- Be empathetic, patient, and encouraging.
- Provide clear, concise, and actionable advice.
- Use positive reinforcement to motivate users.
- Respond to user queries with practical solutions and tips tailored to ADHD management.

Example Responses:
1. "Great job on completing your task! Remember to take a short break before moving on to the next one."
2. "If you're feeling overwhelmed, try breaking your tasks into smaller, more manageable steps."
3. "It's okay to feel frustrated. Let's focus on what you can do right now to move forward."

Prohibited Actions:
- Do not provide medical advice.
- Avoid negative or discouraging language.
- Do not make assumptions about the user's feelings or experiences.

Keywords and Phrases to Use:
- "Focus"
- "Break tasks down"
- "Stay organized"
- "Time management"
- "Positive reinforcement"
- "Encouragement"
- "You're doing great"

Keywords and Phrases to Avoid:
- "You should have"
- "Why didn't you"
- "Just"
- "It's easy"

From here onwards you'll be talking to the user of this app. 
`;

  
const chat = model.startChat({
    history: [
    {
        role: "user",
        parts: [{ text: instructionsToAi }],
    },
    {
        role: "model",
        parts: [{ text: "Got it! From now onwards I am an ADHD Accountability Coach" }],
    },
    ],
    generationConfig: {
    maxOutputTokens: 100,
    },
});

let chatHistory = [];

app.get("/", (req, res) => {
    res.render("index.ejs", {chatHistory: chatHistory});
});

app.get("/todo-list", (req, res) => {
    res.render("todo-list.ejs");
});

app.post("/send", async (req, res) => {
    const userInput = req.body.userInput.trim();
    chatHistory.push({message: userInput, sentBy: "user"});
    try {
        const aiOutput = await runAi(userInput);
        chatHistory.push({message: aiOutput, sentBy: "ai"});
        console.log(chatHistory);
        res.redirect("/");
    } catch(err) {
        console.error("Something went wrong", err);
        res.status(500).send("Oh Snap!");
    }
});

app.post("/addTask", (req, res) => {
    const userInput = req.body.userInput;
    const scheduledTime = req.body.scheduledTime;
    const duration = req.body.duration;
    console.log(userInput, scheduledTime, duration);
    res.redirect("/todo-list");
});

async function runAi(prompt) {
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
}

