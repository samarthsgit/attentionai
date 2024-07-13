import express from "express";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import db from "../routes/db.js";

const router = express.Router();

function isLoggedIn(req, res, next) {
    if(req.user) {
        next();
    } else {
        res.redirect("/");
    }
}

let instructionsToAi = `
Hii! This is the message from the admin to you. I am using you for my app AttentionAI. It is designed for people with ADHD to keep them accountable and provide emotional support.
Although it is focused for ADHD, but other people may also use this.
Role you need to play: You're an experienced Accountability and Productivity coach.
This app also has a 'Tasks' section where people can put their tasks and details like scheduled time and duration.
I have coded this app in a way that whenever there will be 30 minutes left for the scheduled task you'll get prompted to remind user for the task.
So encourage users to put their tasks in todo list wherver you feel they can.
Don't respond to users in big paragraphs. User should feel as if they are talking to an actual person. Keep your response limited and rather encourage a to and fro communication.
`;
let instructionsToAiArr = [
    {
        role: "user",
        parts: [{ text: instructionsToAi }],
    },
    {
        role: "model",
        parts: [{ text: "Got it! From now onwards I am an ADHD Accountability Coach" }],
    },
    ];

////Testing new Method
class AiService {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.chats = new Map(); // Store active chats
    }

    async initializeChat(currentUserEmail) {
        if (!this.chats.has(currentUserEmail)) {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    }
                ]
            });

            const chatHistory = await getChatHistory(currentUserEmail);
            const pushHistory = [...instructionsToAiArr, ...this.formatChatHistory(chatHistory)];

            const chat = model.startChat({
                history: pushHistory,
                generationConfig: {
                    maxOutputTokens: 500, // Increased token limit
                },
            });

            this.chats.set(currentUserEmail, chat);
        }
    }

    formatChatHistory(chatHistory) {
        return chatHistory.map(entry => ({
            role: entry.sent_by === "user" ? "user" : "model",
            parts: [{text: entry.message}]
        }));
    }

    async run(currentUserEmail, prompt) {
        await this.initializeChat(currentUserEmail);
        const chat = this.chats.get(currentUserEmail);
        
        try {
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Error in AI response:", error);
            throw error;
        }
    }
}

const aiService = new AiService(process.env.API_KEY);




//DB queries
async function getChatHistory(currentUserEmail) {
    //try-catch block for getting chat history
    try {
        const response = await db.query(`SELECT *
                                            FROM chats
                                            INNER JOIN users ON chats.user_id = users.id
                                            WHERE users.email=$1;`, [currentUserEmail]);
        return response.rows;
    } catch(err) {
        console.error("Error retrieveing chat history", err);
    }
}



export { router, aiService };
