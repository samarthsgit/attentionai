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
        type: "OBJECT",
        description: "Add tasks in user's Tasks List.",
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