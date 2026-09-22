
/* ==================================================
   CAMPUSFIX
   User MongoDB Model
   ================================================== */

const mongoose = require("mongoose");


// ================= USER SCHEMA =================

const userSchema = new mongoose.Schema(

    {
        // Student's full name
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },


        // Student's email
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },


        // Hashed password
        password: {
            type: String,
            required: true,
            minlength: 6
        }

    },

    {
        // Automatically creates createdAt and updatedAt
        timestamps: true
    }

);


// ================= EXPORT MODEL =================

module.exports =
    mongoose.model("User", userSchema);

