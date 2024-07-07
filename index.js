import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import db from "./routes/db.js";
import authRouter from "./routes/auth.js";
import session from "express-session";
import passport from "passport";
import { router as geminiRouter, runAi } from "./routes/gemini.js";
import appRouter from "./routes/app.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
dotenv.config();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.authenticate('session'));

app.use("/", authRouter);
app.use("/", appRouter);

app.listen(PORT, () => {
    console.log(`Listening at Port ${PORT}`);
});

