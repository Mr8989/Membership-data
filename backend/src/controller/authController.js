import "dotenv/config.js"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId}, process.env.ACCESS_TOKEN, {
        expiresIn: "15m",
    });
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN, {
        expiresIn: "7d",
    });
    return {accessToken, refreshToken}
};

export const signup = async (req, res) => {
    const {name, email , password, confirmPassword, role} = req.body;

    try {
        const userExit = await User.findOne({email})

        if(userExit){
            return res.status(409).json({message: "User already exist"})
        }
        if(password !== confirmPassword){
            return res.status(400).json({message: "Password donot match"})
        }
        const user = await User.create({name, email, password});

        //Generate tokens for the new user
        const {accessToken, refreshToken} = generateToken(user._id);

        res.status(201).json({
            accessToken,
            refreshToken,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            message: "User register successfully"
        })
    } catch (error) {
        console.log("Error in signup route in auth controller", error.message)
        res.status(500).json({meesage: "Internal server error", error: error.meesage})
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email})

        if(user && (await user.comparePassword(password))){
            const {accessToken, refreshToken} = generateToken(user._id);

            res.json({
                accessToken,
                refreshToken,
                id: user._id, 
                name: user.name,
                email: user.email,
                role: user.role,
                message: "Logged in successfully"
            })
        } else{
            res.status(401).json({message: "Invalid email or password"})
        }
    } catch (error) {
        console.log("Error in login controller ", error.message);
        res.status(500).json({message: "Internal server error", error:message})
    }
}

export const logout = async(re, res) => {
    try {
        const refreshToken = req.body.refreshToken;

        if(!refreshToken){
            return res.status(400).json({message:"No refresh token provided for logout"})
        }
        try {     
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN)
        } catch (jwtError) {
            return res.status(401).json({message: "Invalid refresh token for logout", error: jwtError.message})
        }
        res.status(200).json({message: "Logged out successfully"})
    } catch (error) {
        console.log("Error in logout controller",  error.message)
        res.status(500).json({message: "Internal server error", error: error.message})
    }
}

export const refreshToken = async (req, res) => {
    try {
        const oldRefreshToken = req.body.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({ message: "No refresh token provided." });
        }

        let decoded;
        try {
            // Verify the token's signature and expiration.
            decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (jwtError) {
            // If verification fails, the token is invalid or expired.
            return res.status(401).json({ message: "Invalid or expired refresh token.", error: jwtError.message });
        }

        const userId = decoded.userId;

        // Generate a new access token and a new refresh token.
        // This implements refresh token rotation without server-side storage.
        const newAccessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const newRefreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            message: "Tokens refreshed successfully."
        });

    } catch (error) {
        console.error("Error in refreshToken controller:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};