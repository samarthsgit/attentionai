import express from "express";
import db from "../routes/db.js";

const router = express.Router();

router.get('/set-session', async (req, res) => {
    const email = req.user.emails[0].value;
    const userId = await getCurrentUserId(email);
    console.log(`In session handler: UserId ${userId} and Email ${email}`);
    req.session.user = {userId: userId, email: email}
    res.send("Session set successfully!");
});

router.get('/get-session', async (req, res) => {
    // if (req.session.user) {
    //     res.json(req.session.user);
    // } else {
    //     res.sendStatus(404);
    // }
    const userData = await req.session.user;
    console.log(userData);
    console.log(`User data in session handler ${userData}`);
    res.json(userData);
    // res.json({userId: 29});
});

//Database query for getting userId
async function getCurrentUserId(currentUserEmail) {
    const response = await db.query("SELECT id FROM users WHERE email=$1", [currentUserEmail]);
    return response.rows[0].id;
}


export { router }