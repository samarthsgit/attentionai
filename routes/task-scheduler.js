import express from "express";
import schedule from "node-schedule";
import { router as geminiRouter,aiService } from "../routes/gemini.js";
import db from "../routes/db.js";

const router = express.Router();

class scheduler {
    constructor(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail) {
        this.taskName = taskName;
        this.scheduledTime = scheduledTime;
        this.currentDateString = currentDateString;
        this.duration = duration;
        this.currentUserId = currentUserId;
        this.currentUserEmail = currentUserEmail;
    }

    setRemindTime() {
        const currentDate = new Date(this.currentDateString);
        const [hours, minutes] = this.scheduledTime.split(':');
        const hoursInt = parseInt(hours, 10);
        const minutesInt = parseInt(minutes, 10);
        currentDate.setHours(hoursInt, minutesInt, 0);
        this.remindTime = currentDate;
        const job = schedule.scheduleJob(this.remindTime, () => {
            console.log(`Scheduler Workded`);
            this.triggerAi(this.taskName);
        });
    }

    async triggerAi(taskName) {
        console.log(`Ai triggered!!! ${taskName}`);
        const adminMsg = `Message from admin: User has entered a task in their todo list and it is scheduled from 30 minutes from now. Send them a gentle reminder. Task name is : ${taskName}`;
        try {
            const aiOutput = await aiService.run(this.currentUserEmail, adminMsg);
            await this.pushChatToDb(this.currentUserId, aiOutput, "ai");
            //From here I want to redirect user to /app
            
        } catch(err) {
            console.error("Error triggering ai", err);
        }
    }

    async pushChatToDb(currentUserId, message, sent_by) {
        //try-catch to push chat to db
        try {
            await db.query(`INSERT INTO chats (user_id, message, sent_by) VALUES ($1, $2, $3)`, [currentUserId, message, sent_by]);
        } catch(err) {
            console.error("Error pushing msg to db", err);
        }
    }
}

// async function triggerRedirect(redirect = false) {
//     return redirect;
// }

function taskScheduler(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail) {
    const task = new scheduler(taskName, scheduledTime, currentDateString, duration, currentUserId, currentUserEmail);
    task.setRemindTime();
}

export { taskScheduler };