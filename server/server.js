
/* ==================================================
   CAMPUSFIX
   Main Node.js + Express Server
   ================================================== */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

// Use public DNS to reliably resolve MongoDB Atlas SRV records on Windows
dns.setServers(["8.8.8.8", "1.1.1.1"]);


// ================= LOAD ENVIRONMENT =================

dotenv.config();


// ================= CREATE APP =================

const app = express();


// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ================= FRONTEND =================

const publicPath =
    path.join(__dirname, "..", "public");

app.use(express.static(publicPath));


// ================= API ROUTES =================

const authRoutes =
    require("./routes/auth");

const complaintRoutes =
    require("./routes/complaints");

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/complaints",
    complaintRoutes
);


// ================= HOME ROUTE =================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            publicPath,
            "index.html"
        )
    );

});


// ================= HEALTH CHECK =================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "CampusFix server is running."
    });

});


// ================= 404 API =================

app.use("/api", (req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found."
    });

});


// ================= ERROR HANDLER =================

app.use((error, req, res, next) => {

    console.error(
        "Server Error:",
        error
    );

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });

});


// ================= MONGODB =================

const PORT =
    process.env.PORT || 5000;

const MONGO_URI =
    process.env.MONGO_URI;


let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is missing from .env");
    }
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected successfully.");
}

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("Database connection error:", err.message);
        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`CampusFix running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start CampusFix:", error.message);
        process.exit(1);
    }
}

if (process.env.RENDER || !process.env.VERCEL) {
    startServer();
}

module.exports = app;

