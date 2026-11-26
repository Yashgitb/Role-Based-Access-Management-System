import User from "../models/User.js";
import "../models/Role.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // 1. Validate input
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        } 
        
        // 2. Find user and retrieve role
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        })
            .select("+password")
            .populate("role");

        // 3. Check whether user exists
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 4. Verify password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 5. Check account status
        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account is deactivated"
            });
        }
        

        //6.Check assigned role
        if(!user.role){
            return res.status(403).json({
                message:"No valid role assigned"
            })
        }

        // 7. Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );
        // 8. Return successful response
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                permissions: user.role.permissions,
                isActive: user.isActive
            }
        });
        } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const getProfile = (req, res) => {
    return res.status(200).json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role.name,
            permissions: req.user.role.permissions,
            isActive: req.user.isActive
        }
    });
};


export const logout = (req, res) => {
    return res.status(200).json({
        message: "Logout successful"
    });
};
