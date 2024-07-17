//Gemini custom function. Enable to AI to add tasks auto.
import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { io } from "../index.js";
import axios from "axios";

dotenv.config();
const router = express.Router();

//Custom Function Definition
const aiAddTaskFuncDeclaration = {
    name: "aiAddTask",
    parameters: {
        tpye: "OBJECT",
        description: "Add tasks in user's Tasks List",
        properties: {
            taskName: {
                type: "STRING",
                description: "Task name"
            },
            scheduledTime: {
                type: "STRING",
                description: "Scheduled time for the task. Use 24 hour HH:MM format. Return a string HH:MM"
            },
            duration: {
                type: "NUMBER",
                description: "Duration of task in minutes"
            }
        },
        required: ["taskName", "scheduledTime", "duration"]
    }
}

// Executable function code. Put it in a map keyed by the function name
// so that you can call it once you get the name string from the model.
const functions = {
    aiAddTask: async ({taskName, scheduledTime, duration}) => {
        //Fetch userid from /user-id
        // try {
        //     const response = await axios.get("/user-id");
        //     const userId = response.data.userId;
        // } catch(err) {
        //     console.error("Error fetching userId in custom", err)
        // }
        const response = await axios.get("/user-id");
        const userId = response.data.userId;
        io.to("redirect-room").emit('addDateAndPostToServer', { taskName: taskName, scheduledTime: scheduledTime, duration: duration, userId: userId });
    }
}






export default router;