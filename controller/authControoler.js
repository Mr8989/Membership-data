import User from "../models/User.js";
import jwt from "jsonwebtoken"; // No need for 'decode' directly here
import client from "../lib/redis.js"; // Assuming 'client' is your Redis client instance

// Remove `set` from mongoose as it's not used
// import { set } from "mongoose"; 

const generateToken = (userId) => { // Ensure userId is passed
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { // Corrected ACCESS_TOKEN_SCRET
        expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    // Consistent Redis key for refresh tokens
    await client.set(`refresh_Token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 days in seconds
};

// Removed setCookies function as tokens will be sent in the response body for mobile apps

export const signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(409).json({ message: "User already exists." });
        }

        // Ensure password hashing happens before saving (assuming User.create handles this or pre-save hook)
        const user = await User.create({ name, email, password, role });

        // Authentication: generate tokens for the new user
        const { accessToken, refreshToken } = generateToken(user._id); // Use user._id for consistency

        // Store refresh token on the server-side
        await storeRefreshToken(user._id, refreshToken);

        // Send tokens in the response body to the mobile client
        res.status(201).json({
            accessToken,
            refreshToken, // Send refresh token to mobile client for secure storage
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            message: "User registered successfully."
        });
    } catch (error) {
        console.error("Error in signup route authController:", error.message); // Use console.error for errors
        res.status(500).json({ message: "Internal server error.", error: error.message }); // Send error.message only
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id); // Use user._id
            await storeRefreshToken(user._id, refreshToken);

            res.json({
                accessToken, // Send access token to mobile client
                refreshToken, // Send refresh token to mobile client
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: "Logged in successfully."
            });
        } else {
            res.status(401).json({ message: "Invalid email or password." }); // Correct status code for invalid login
        }
    } catch (error) {
        console.error("Error in login controller:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        // For mobile apps, the client should send the refresh token in the body or a header for logout
        const refreshToken = req.body.refreshToken; // Assuming it's sent in the body

        if (!refreshToken) {
            return res.status(400).json({ message: "No refresh token provided for logout." }); // Bad request
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (jwtError) {
            return res.status(401).json({ message: "Invalid refresh token for logout.", error: jwtError.message });
        }

        // Delete the refresh token from Redis
        await client.del(`refresh_Token:${decoded.userId}`); // Consistent Redis key

        // No cookies to clear from server-side for mobile app scenario
        res.status(200).json({ message: "Logged out successfully." });

    } catch (error) {
        console.error("Error in logout controller:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        // For mobile apps, the client sends the refresh token in the body or a custom header
        const oldRefreshToken = req.body.refreshToken; // Or req.headers['x-refresh-token']

        if (!oldRefreshToken) {
            return res.status(401).json({ message: "No refresh token provided." });
        }

        let decoded;
        try {
            decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (jwtError) {
            return res.status(401).json({ message: "Invalid refresh token.", error: jwtError.message });
        }

        const userId = decoded.userId;

        // Check if the refresh token exists in Redis and matches the one provided
        const storedToken = await client.get(`refresh_Token:${userId}`); // Consistent Redis key

        if (!storedToken || storedToken !== oldRefreshToken) {
            // This could indicate a stolen/reused token or that it was already invalidated
            console.warn(`Invalid or reused refresh token detected for user ${userId}. Attempting to revoke.`);
            // Implement refresh token family revocation if a token is reused for stronger security
            if (storedToken) { // Only delete if a token was actually found
                await client.del(`refresh_Token:${userId}`); // Invalidate the old token
            }
            return res.status(403).json({ message: "Invalid or compromised refresh token. Please log in again." });
        }

        // Generate a new access token
        const newAccessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" }); // Corrected ACCESS_TOKEN_SCRET

        // Implement refresh token rotation: generate a new refresh token
        const newRefreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        // Invalidate the old refresh token in Redis and store the new one
        await client.del(`refresh_Token:${userId}`); // Invalidate old
        await client.set(`refresh_Token:${userId}`, newRefreshToken, "EX", 7 * 24 * 60 * 60); // Store new

        // Send the new access token and the new refresh token in the response body
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken, // Send the new refresh token for rotation
            message: "Tokens refreshed successfully."
        });

    } catch (error) {
        console.error("Error in refreshToken controller:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};