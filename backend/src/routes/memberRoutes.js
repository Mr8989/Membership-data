import express from "express";
import { processAttendance, getMonthlyAttendanceStats, getAttendanceByDate } from "../controller/memberController.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const router = express.Router();

//router.post("/create", newMembers);
//router.get("/members", getMembers);
router.post("/process-attendance", upload.single('file'), processAttendance);
router.get("/stat/monthly", getMonthlyAttendanceStats)
router.get("/stat/daily", getAttendanceByDate)



export default router;