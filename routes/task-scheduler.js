import express from "express";

const router = express.Router();


class scheduler {
    constructor(taskName, scheduledTime, currentDateString, duration, currentUserId) {
        this.taskName = taskName;
        this.scheduledTime = scheduledTime;
        this.currentDateString = currentDateString;
        this.duration = duration;
        this.currentUserId = currentUserId;
    }

    setRemindTime() {
        const currentDate = new Date(this.currentDateString);
        const [hours, minutes] = this.scheduledTime.split(':');
        const hoursInt = parseInt(hours, 10);
        const minutesInt = parseInt(minutes, 10);
        currentDate.setHours(hoursInt, minutesInt, 0);
        this.remindTime = currentDate;
    }
}

export function taskScheduler(taskName, scheduledTime, currentDateString, duration, currentUserId) {
    const task = new scheduler(taskName, scheduledTime, currentDateString, duration, currentUserId);
    task.setRemindTime();
}