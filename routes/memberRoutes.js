import express, { Router } from "express";
import {newMembers,getMembers, processAttendance} from "../controller/memberController";
import multer from "multer";

const upload = multer({storage: storage});



const router = Router.express();

router.post("/create",newMembers);
router.get("/members", getMembers);
router.post("/process-attendance", upload.single('file'), processAttendance);


export default router;
