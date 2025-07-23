import User from "../models/User.js";
import jwt, { decode } from "jsonwebtoken";
import client from "../lib/redis.js"
import { set } from "mongoose";

const generateToken = () => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SCRET,{
        expiresIn: "15m",
    });
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    })
    return {accessToken, refreshToken};
}

const storeRefreshToken = async (userId, refreshToken) =>{
    await client.set(`refresh_Token: ${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60)// 7days
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //prevent Xss attack cross site platform
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //prevent csrf attack, cross site request forgery
        maxAge: 15 * 60 * 1000 //15 minutes
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", 
        maxAge: 7 * 24 * 60 * 1000 // 15days
    })
}

export const signup = async(req, res) =>{
    const {name, email, password, role} = req.body;
    try {
        const userExist = await User.findOne({email})
        if(userExist){
            return res.status(409).json({message: "User already exist"});
        }
        const user = User.create({name, email, password, role});

        await user.save();

        //authentication
        const{accessToken, refreshToken} = generateToken(user._id)
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken)

        res.status(201).json({
            accessToken,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        })
    } catch (error) {
        console.log("Error in sigup route authController", error.message)
        res.status(500).json({message: "Internal server error", error: error})
    }
}

export const login = async (req, res ) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email})
        if(user && (await user.comparePassword(password))){
            const {accessToken, refreshToken} = generateToken(user.id)
            await storeRefreshToken(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken)

            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            })
        }
    } catch (error) {
        console.log("Error in login controller", error.message)
        res.status(201).json({message: "Invalid login"})
    }
}

export const logout = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            await client.del(`refresh_token: ${decoded.userId}`)
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({message:"Logout successfully"})

    } catch (error) {
        console.log("Error in logout controller")
        res.status(500).json({message:"server error",error: error.message})
    }
}

export const refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookie.refreshToken;
        
        if(!refreshToken){
            return res.status(401).json({message: "No refresh token provided"})
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const storeToken = await client.get(`refreshToken: ${decoded.userId}`)

        if(storeToken !== refreshToken){
            return res.status(401).json({message: " Invalid refreshtoken"})
        }
        const acccessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SCRET, {expiresIn: "15m"})
        res.cookie("accessToken", acccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: "15 * 60 * 1000"
        });
        res.json({message: "Token refresh successfull"})
    } catch (error) {
        console.log("Error in refreshToken", error.message)
        res.status(401).json({message: "server error", error: error.message})
    }
}