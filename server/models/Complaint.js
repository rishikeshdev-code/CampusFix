
/* ==================================================
   CAMPUSFIX
   Complaint MongoDB Model
   ================================================== */

const mongoose = require("mongoose");


// ================= COMPLAINT SCHEMA =================

const complaintSchema = new mongoose.Schema(

    {
        // Unique complaint ID shown to the student
        complaintId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },


        // Student who submitted the complaint
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // Short complaint title
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },


        // Complaint category
        category: {
            type: String,
            required: true,
            enum: [
                "classroom",
                "laboratory",
                "library",
                "washroom",
                "canteen",
                "electricity",
                "cleanliness",
                "internet",
                "other"
            ]
        },


        // Location of the problem
        location: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },


        // Detailed explanation
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },


        // Complaint priority
        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high"
            ],
            default: "medium"
        },


        // Complaint status
        status: {
            type: String,
            enum: [
                "pending",
                "under-review",
                "resolved",
                "rejected"
            ],
            default: "pending"
        }

    },

    {
        // Automatically creates createdAt and updatedAt
        timestamps: true
    }

);


// ================= EXPORT MODEL =================

module.exports =
    mongoose.model(
        "Complaint",
        complaintSchema
    );

