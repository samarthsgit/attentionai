// import express from "express";
// import schedule from "node-schedule";
// import { router as geminiRouter,aiService } from "../routes/gemini.js";
// import db from "../routes/db.js";
// import { io } from "../index.js";

// const router = express.Router();

// class scheduler {
//     constructor(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail) {
//         this.taskName = taskName;
//         this.scheduledTime = scheduledTime;
//         this.currentDateString = currentDateString;
//         this.duration = duration;
//         this.currentUserId = currentUserId;
//         this.currentUserEmail = currentUserEmail;
//     }

//     setRemindTime() {
//         const currentDate = new Date(this.currentDateString);
//         const [hours, minutes] = this.scheduledTime.split(':');
//         const hoursInt = parseInt(hours, 10);
//         const minutesInt = parseInt(minutes, 10);
//         currentDate.setHours(hoursInt, minutesInt, 0);
//         this.remindTime = currentDate;
//         const job = schedule.scheduleJob(this.remindTime, () => {
//             console.log(`Scheduler Worked`);
//             this.triggerAi(this.taskName);
//         });
//     }

//     async triggerAi(taskName) {
//         console.log(`Ai triggered!!! ${taskName}`);
//         const adminMsg = `Message from admin: User has entered a task in their todo list and it is scheduled from 30 minutes from now. Send them a gentle reminder. Task name is : ${taskName}`;
//         try {
//             const aiOutput = await aiService.run(this.currentUserEmail, adminMsg);
//             await this.pushChatToDb(this.currentUserId, aiOutput, "ai");
//             //From here redirect user to /app
//             //For some reason, sending to specific id didn't work
//             io.to("redirect-room").emit('redirect', { url: '/app', userId: this.currentUserId });
//             console.log(`Emitted redirect event to user ${this.currentUserId}`);
            
//         } catch(err) {
//             console.error("Error triggering ai", err);
//         }
//     }

//     async pushChatToDb(currentUserId, message, sent_by) {
//         //try-catch to push chat to db
//         try {
//             await db.query(`INSERT INTO chats (user_id, message, sent_by) VALUES ($1, $2, $3)`, [currentUserId, message, sent_by]);
//         } catch(err) {
//             console.error("Error pushing msg to db", err);
//         }
//     }
// }

// // async function triggerRedirect(redirect = false) {
// //     return redirect;
// // }

// function taskScheduler(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail) {
//     const task = new scheduler(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail);
//     task.setRemindTime();
// }

// export { taskScheduler };


//Testing with node-cron
import express from "express";
import cron from "node-cron";
import { router as geminiRouter, aiService } from "../routes/gemini.js";
import db from "../routes/db.js";
import { io } from "../index.js";
import axios from "axios";
import dotenv from "dotenv";
import moment from "moment-timezone";

dotenv.config();
const router = express.Router();

class Scheduler {
    constructor(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail, clientTimezone) {
        this.taskName = taskName;
        this.scheduledTime = scheduledTime;
        this.currentDateString = currentDateString; //Retreived from Client side
        this.duration = duration;
        this.currentUserId = currentUserId;
        this.currentUserEmail = currentUserEmail;
        this.clientTimezone = clientTimezone;
    }

    setRemindTime() {
        const currentDate = new Date(this.currentDateString);
        const [hours, minutes] = this.scheduledTime.split(':');
        const hoursInt = parseInt(hours, 10);
        const minutesInt = parseInt(minutes, 10);
        currentDate.setHours(hoursInt, minutesInt, 0);
        this.remindTime = currentDate;

        const cronExpression = `${minutesInt} ${hoursInt} ${currentDate.getDate()} ${currentDate.getMonth() + 1} *`;
        
        // // Extract timezone from currentDate
        // const timezoneOffset = -currentDate.getTimezoneOffset(); // in minutes
        // const timezone = moment.tz.guess(); // Get the timezone name

        cron.schedule(cronExpression, () => {
            console.log(`Scheduler Worked`);
            this.triggerAi(this.taskName);
        }, {
            scheduled: true,
            timezone: this.clientTimezone // Adjust timezone as needed
        });
    }

    async triggerAi(taskName) {
        console.log(`Ai triggered!!! ${taskName}`);
        const adminMsg = `Message from admin: User has entered a task in their todo list and it is scheduled from 30 minutes from now. Send them a gentle reminder. Task name is : ${taskName}`;
        try {
            const aiOutput = await aiService.run(this.currentUserEmail, adminMsg);
            await this.pushChatToDb(this.currentUserId, aiOutput, "ai");
            io.to("redirect-room").emit('redirect', { url: '/app', userId: this.currentUserId });
            console.log(`Emitted redirect event to user ${this.currentUserId}`);
            //Sending notification using service-worker
            try {
                await axios.post(`${process.env.DOMAIN_NAME}/send-notification`, {
                    userId: this.currentUserId,
                    aiMessage: aiOutput
                });
            } catch(err) {
                console.error("Error posting to sw", err);
            }
        } catch(err) {
            console.error("Error triggering ai", err);
        }
    }

    async pushChatToDb(currentUserId, message, sent_by) {
        try {
            await db.query(`INSERT INTO chats (user_id, message, sent_by) VALUES ($1, $2, $3)`, [currentUserId, message, sent_by]);
        } catch(err) {
            console.error("Error pushing msg to db", err);
        }
    }
}

function taskScheduler(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail, clientTimezone) {
    const task = new Scheduler(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail, clientTimezone);
    task.setRemindTime();
}

export { taskScheduler };