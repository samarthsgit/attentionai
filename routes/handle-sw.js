import express from "express";
import dotenv from "dotenv";
import db from "../routes/db.js";
import webPush from "web-push";

dotenv.config();
const router = express.Router();

const apiKeys = {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY
}
//Setting vapid details
webPush.setVapidDetails(
    'mailto:samarthchouksey18@gmail.com',
    apiKeys.publicKey,
    apiKeys.privateKey
);

const subscriptionData = [];

router.post("/save-subscription", async (req, res) => {
    console.log("It reached handle-sw")
    const subscription = req.body.subscription;
    const userId = req.body.userId;
    console.log(`User id recieved to server ${userId}`);
    //Add to DB
    await storeSubscription(userId, subscription);
    // subscriptionData.push(subscription);
    
});

router.post("/send-notification", async (req, res) => {
    const userId = req.body.userId;
    console.log(`User id recieve ind send-not ${userId}`)
    const subscription = await getSubscription(userId);
    console.log(`Subscription recievd in send-not ${subscription}`)
    webPush.sendNotification(subscription, "Hello World!");
    res.json({"status": "Success", "message": "Message sent to push service"});
});


//DB Queries
async function storeSubscription(userId, subscription) {
    try {
        const response = await db.query('INSERT INTO sw (user_id, subscription) VALUES ($1, $2) RETURNING *', [userId, subscription]);
        console.log(response.rows[0].subscription)
        console.log(typeof response.rows[0].subscription)
    } catch(err) {
        console.error("Error storing sw-subscription", err);
    }
}

async function getSubscription(userId) {
    try {
        const response = await db.query('SELECT subscription FROM sw WHERE user_id=$1 ORDER BY id DESC', [userId]);
        return response.rows[0].subscription;
    } catch(err) {
        console.error("Error retrieveing sw-subscription", err);
    }
}



export default router;