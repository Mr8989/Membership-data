import "dotenv/config.js"
import mongoose from "mongoose"

export const connectDB = async (req, res) => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database is connected to ${conn.connection.host}`)
    } catch (error) {
        console.log("Error in connecting to database", error.message)
    }
}