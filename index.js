import express from "express";
import dotenv from "dotenv/config.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import job from "./lib/cron.js";



const app = express();

const PORT = process.env.PORT || 5000;

job.start();
app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})