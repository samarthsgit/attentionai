import express from "express";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import db from "../routes/db.js";
import { aiAddTaskFuncDeclaration, customFunctions } from "../routes/gemini-custom-func.js";
import markdown from 'markdown-it';
import { marked } from 'marked';

const router = express.Router();
// const md = markdown();
const md = markdown({
    html: true,
    linkify: true,
    // typographer: true
  });
  


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
You can also add the tasks on their behalf by running the custom function. Name of custom function is aiAddTask. Be very careful : You can only add the tasks by running the Custom Function aiAddTask otherwise not! To run this function you'll need - Task name, scheduled time, duration. Don't add any task until you have all 3 details.
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
        parts: [{ text: "Got it! From now onwards I am an ADHD Accountability Coach. I'll use Custom Function aiAddTask to add the tasks in user's task list" }],
    },
    ];

////Testing new Method
class AiService {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.chats = new Map(); // Store active chats
    }

    async initializeChat(currentUserEmail) {
        // console.log(this.chats); //remove this
        if (!this.chats.has(currentUserEmail)) {
            console.log("Initialize chat block hit!!!"); //Remove this
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-pro",

                // Specify the function declaration.
                tools: {
                    functionDeclarations: [aiAddTaskFuncDeclaration],
                },
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

    async run(currentUserId, currentUserEmail, prompt) {
        await this.initializeChat(currentUserEmail);
        const chat = this.chats.get(currentUserEmail);
        
        try {
            const result = await chat.sendMessage(prompt);
            
            const functionCalls = result.response.functionCalls();
            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                console.log(call);
                //check call name
                if(call.name == 'aiAddTask') {
                    // Call the executable function named in the function call
                    // with the arguments specified in the function call and
                    call.args.userId = currentUserId; //adding an extra arg
                    console.log(call.args);
                    const customFuncResponse = await customFunctions[call.name](call.args);
                    console.log("Custom func execution complete");
                    console.log(customFuncResponse); //remove
                    //Send this response back to model
                    // const newResponse = await chat.sendMessage([{functionResponse: {
                    //     name: 'aiAddTask',
                    //     response: customFuncResponse
                    // }}]);
                    // console.log(newResponse);
                    
                    //Logging text response
                    // console.log(`Custom function is called: ${newResponse.text()}`);
                    return "Successfully added task!";
                }
            } else {
                const response = await result.response;
                console.log(`From else: ${response.text()}`);
                const formattedOutput = md.render(response.text());
                // const formattedOutput = marked.parse(response.text());
                return formattedOutput;
            }

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
