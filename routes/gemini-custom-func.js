//Gemini custom function. Enable to AI to add tasks auto.
import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { io } from "../index.js";
import axios from "axios";

dotenv.config();
const router = express.Router();

const aiAddTaskDesc = `The primary purpose of the function is to streamline the task management process for users by allowing them to easily add tasks to their task list through natural language interaction with the AI.
Function Description

The function is designed to assist users in managing their tasks by adding them to their task list. This function interacts with the user to gather necessary information about the task, such as the task name, scheduled time, and duration. Once the information is collected, the function adds the task to the user's task list through an API endpoint.
User Interaction Flow

    Task Detection: When the user mentions a potential task during the conversation, the AI should detect this and prompt the user to add it to their task list.
        Example: User says, "I need to finish the project report tomorrow."
        AI Response: "Would you like me to add 'finish the project report' to your task list?"

    Encouragement: If the user agrees or expresses interest in adding the task, the AI should encourage them to provide the necessary details.
        AI Prompt: "Great! Please provide the scheduled time and duration for this task."

    Information Collection: The AI should collect the following information from the user:
        Task Name: The name or title of the task.
            Prompt: "What is the name of the task?"
        Scheduled Time: The time at which the task is scheduled to start, in HH
        format (24-hour clock).
            Prompt: "When is the task scheduled to start? Please provide the time in HH
            format."
        Duration: The duration of the task in minutes.
            Prompt: "How long will the task take? Please provide the duration in minutes."

    Function Execution: Once all the necessary information is collected, the AI should call the function with the gathered parameters.

    API Interaction: The function will then interact with the API endpoint to add the task to the user's task list.

Error Handling

    Missing Information: If the user does not provide all the necessary information, the AI should prompt them again to fill in the missing details.
        Example: If the user provides the task name and scheduled time but not the duration, the AI should say, "I still need the duration of the task. How long will it take in minutes?"
        `

//Custom Function Definition
const aiAddTaskFuncDeclaration = {
    name: "aiAddTask",
    parameters: {
        type: "OBJECT",
        description: aiAddTaskDesc,
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

//Testing
const controlLightFunctionDeclaration = {
    name: "controlLight",
    parameters: {
      type: "OBJECT",
      description: "Set the brightness and color temperature of a room light.",
      properties: {
        brightness: {
          type: "NUMBER",
          description: "Light level from 0 to 100. Zero is off and 100 is full brightness.",
        },
        colorTemperature: {
          type: "STRING",
          description: "Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.",
        },
      },
      required: ["brightness", "colorTemperature"],
    },
};
  

// Executable function code. Put it in a map keyed by the function name
// so that you can call it once you get the name string from the model.
const customFunctions = {
    aiAddTask: async ({taskName, scheduledTime, duration, userId}) => {
        console.log("Custom function aiAddTask ran!!"); //remove this
        console.log(`Data provided to custom function ${taskName} ${scheduledTime} ${duration} ${userId}`); //remove this
        //Try-catch for getting user-id
        try {
          const response = await axios.get(`${process.env.DOMAIN_NAME}/get-session`);
          // console.log(response.data);
          const userId = response.data.userId;
          // console.log(`User id retrieved in custom f ${userId}`); //remove this
        } catch(err) {
          console.error("Error getting user id in custom f", err);
        }
        //try-catch for web scoket
        try {
          io.to("redirect-room").emit('addDateAndPostToServer', { taskName: taskName, scheduledTime: scheduledTime, duration: duration, userId: userId });
          // return { taskName: taskName, scheduledTime: scheduledTime, duration: duration }
          return {outcome: "Success!"}
        } catch(err) {
          console.error("Error sending data to client side", err);
        }
        
    },
    //Testing
    controlLight: ({ brightness, colorTemp }) => {
        return setLightValues( brightness, colorTemp)
      }    
}






export {router, aiAddTaskFuncDeclaration, customFunctions, controlLightFunctionDeclaration};