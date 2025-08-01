import express from "express";
import { signup, login, logout, refreshToken } from "../controller/authController.js";


const router = express.Router();

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.post("/refreshToken", refreshToken)


export default router;