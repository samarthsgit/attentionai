import express from "express";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import passport from "passport";
import dotenv from "dotenv";
import db from "../routes/db.js";

dotenv.config();
const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/redirect"
  },
  async function(accessToken, refreshToken, profile, cb) {
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const email = profile.emails[0].value;
    const photoLink = profile.photos[0].value;
    const password = "google";
    console.log(firstName, lastName, email);
    //try-catch block for checking user existence
    try {
        const response = await db.query("SELECT * FROM users WHERE email=$1", [email]);
        if (response.rowCount > 0) {
            //user exist in db
            return cb(null, profile);
        } else {
            //user not exist in db --> add user to db
            //try-catch block for adding new user in DB
            try {
                await db.query(`INSERT INTO users (email, password, first_name, last_name, photo_link) 
                VALUES ($1, $2, $3, $4, $5)`, [email, password, firstName, lastName, photoLink]);
                return cb(null, profile);
            } catch(err) {
                console.log("Error adding new user to DB", err);
            } 
        }
    } catch(err) {
        console.error("Error checking user existence in DB", err);
    } 
  }
));

router.get("/auth/google", 
    passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/auth/google/redirect', 
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect("/app");
    });

passport.serializeUser(function(user, cb) {
    cb(null, user);
    });
    
    passport.deserializeUser(function(user, cb) {
    cb(null, user);
    });



export default router;