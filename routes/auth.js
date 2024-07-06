import express from "express";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/redirect"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    return cb(null, profile);
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