import express from "express";
import { connectDB } from "./lib/db.js";
import "dotenv/config.js"
import cors from "cors"
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoutes.js"
import memberRoute from "./routes/memberRoutes.js"


const app = express();

const PORT = process.env.PORT || 5000;


app.use(cors())
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/auth",memberRoute)

app.listen(PORT,() => {
    console.log(`Server is running on ${PORT}`); 
    connectDB()
} )