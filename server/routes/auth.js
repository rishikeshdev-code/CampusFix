
/* ==================================================
   CAMPUSFIX
   Authentication Routes
   Register + Login + Forgot Password
   ================================================== */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const router = express.Router();


// ================= JWT SECRET =================

const JWT_SECRET =
    process.env.JWT_SECRET || "campusfix-development-secret";


// ================= REGISTER =================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Check required fields
        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields."
            });

        }


        // Check password length
        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });

        }


        // Check existing user
        const existingUser =
            await User.findOne({
                email: email.toLowerCase().trim()
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user
        const user =
            await User.create({

                name: name.trim(),

                email: email
                    .toLowerCase()
                    .trim(),

                password: hashedPassword

            });


        res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }

        });

    } catch (error) {

        console.error(
            "Register error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to create account."

        });

    }

});


// ================= LOGIN =================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Check fields
        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email and password."

            });

        }


        // Find user
        const user =
            await User.findOne({
                email: email.toLowerCase().trim()
            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // Create login token
        const token =
            jwt.sign(

                {
                    userId: user._id
                },

                JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        res.json({

            success: true,

            message:
                "Login successful.",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to login."

        });

    }

});


// ================= FORGOT PASSWORD =================

router.post(
    "/forgot-password",
    async (req, res) => {

        try {

            const {
                email
            } = req.body;


            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter your email address."

                });

            }


            /*
                For security, don't reveal whether
                an email exists in the database.
            */

            const user =
                await User.findOne({
                    email: email.toLowerCase().trim()
                });


            if (!user) {

                return res.json({

                    success: true,

                    message:
                        "If the account exists, reset instructions have been sent."

                });

            }


            /*
                Email reset functionality will be added
                later using a secure reset token.

                We don't send or expose passwords here.
            */

            res.json({

                success: true,

                message:
                    "If the account exists, reset instructions have been sent."

            });

        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to process the request."

            });

        }

    }
);


// ================= EXPORT ROUTER =================

module.exports = router;

