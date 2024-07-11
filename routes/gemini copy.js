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
    constructor(currentUserEmail) {
        this.genAI = new GoogleGenerativeAI(process.env.API_KEY);
        this.userEmail = currentUserEmail;
    }

    async start() {
        const chatHistory = await getChatHistory(this.userEmail);
        const pushHistory = instructionsToAiArr;
        chatHistory.forEach(entry => {
            let sentBy;
            if (entry.sent_by == "user") {
                sentBy = "user";
            } else {
                sentBy = "model";
            }
            const chatObj = {
                role: sentBy,
                parts: [{text: entry.message}]
            }
            pushHistory.push(chatObj);
        });
        const model = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                }
            ]  });
        this.chat = model.startChat({
            history: pushHistory,
            generationConfig: {
                maxOutputTokens: 100,
            },
        });
    }

    async run(prompt) {
        console.log(this.userEmail);
        const result = await this.chat.sendMessage(prompt);
        const response = await result.response;
        const text = await response.text();
        return text;
    }
}


//New Changes
function initaiteAi() {
    const aiService = new AiService(currentUserEmail);
    return aiService;
}

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
