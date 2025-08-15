import express from "express";
import multer from "multer";
import {importMemberFromCSV} from "../controller/iMemberController.js";

const router = express.Router();
const upload = multer({dest: "uploads/"})


router.post("/import", upload.single("file"), importMemberFromCSV)




export default router;