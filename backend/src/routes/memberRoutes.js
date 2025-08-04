import express from "express";
import { newMembers, getMembers, processAttendance } from "../controller/memberController.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const router = express.Router();

router.post("/create", newMembers);
router.get("/members", getMembers);
router.post("/process-attendance", upload.single('file'), processAttendance);


export default router;