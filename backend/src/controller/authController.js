import "dotenv/config.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Removed the redis import as it's no longer used.

/**
 * Generates an access token and a refresh token for a given user ID.
 * The tokens are signed with their respective secrets and have different expiration times.
 * @param {string} userId - The ID of the user.
 * @returns {{accessToken: string, refreshToken: string}} - The access and refresh tokens.
 */
const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
};

// Removed the 'storeRefreshToken' function as it's no longer needed.

/**
 * Registers a new user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(409).json({ message: "User already exists." });
        }

        const user = await User.create({ name, email, password });

        // Generate tokens for the new user.
        const { accessToken, refreshToken } = generateToken(user._id);

        // NOTE: Server-side refresh token storage has been removed.
        // The client is now responsible for securely storing the refresh token.

        res.status(201).json({
            accessToken,
            refreshToken,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            message: "User registered successfully."
        });
    } catch (error) {
        console.error("Error in signup route authController:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

/**
 * Logs in a user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id);
            // NOTE: Server-side refresh token storage has been removed.

            res.json({
                accessToken,
                refreshToken,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: "Logged in successfully."
            });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }
    } catch (error) {
        console.error("Error in login controller:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

/**
 * Logs out a user by invalidating their refresh token on the client side.
 * The server-side logic for deleting from a cache has been removed.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const logout = async (req, res) => {
    try {
        // Since there is no server-side cache, this route primarily signals the
        // client to discard its tokens. It's a good practice to still verify
        // the token to ensure the request is from an authenticated source.
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ message: "No refresh token provided for logout." });
        }

        try {
            // Verify the token's signature, but we don't need to check for
            // a corresponding stored token.
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (jwtError) {
            return res.status(401).json({ message: "Invalid refresh token for logout.", error: jwtError.message });
        }

        // The server is now stateless. We simply acknowledge the logout.
        // The client is responsible for discarding its tokens.
        res.status(200).json({ message: "Logged out successfully." });

    } catch (error) {
        console.error("Error in logout controller:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

/**
 * Refreshes an access token using a valid refresh token.
 * This version does not use server-side state (Redis) to check for token validity.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
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