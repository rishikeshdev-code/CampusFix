
const express = require("express");
const jwt = require("jsonwebtoken");

const Complaint = require("../models/Complaint");
const User = require("../models/user");
const {
  sendComplaintResolvedEmail
} = require("../utils/email");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "campusfix-development-secret";

/*
  Authentication middleware
  Checks whether the user is logged in before
  allowing protected complaint operations.
*/
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Please login first."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session."
    });
  }
}

/*
  Moderator authentication middleware
  Checks whether the logged-in user is a moderator.
*/
async function authenticateModerator(req, res, next) {

  try {

    const user = await User.findById(req.userId);

    if (!user) {

      return res.status(401).json({
        success: false,
        message: "User account not found."
      });

    }

    if (user.role !== "moderator") {

      return res.status(403).json({
        success: false,
        message: "Moderator access required."
      });

    }

    req.user = user;

    next();

  } catch (error) {

    console.error(
      "Moderator authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify moderator access."
    });

  }

}

/*
  Generate a simple complaint ID
  Example: CF-A7K29P
*/
function generateComplaintId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return `CF-${code}`;
}

/*
  POST /api/complaints
  Submit a new complaint.
*/
router.post("/", authenticateUser, async (req, res) => {
  try {
    const {
      title,
      category,
      location,
      description,
      priority
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required complaint fields."
      });
    }

    let complaintId;
    let existingComplaint;

    // Make sure the generated ID is unique.
    do {
      complaintId = generateComplaintId();

      existingComplaint = await Complaint.findOne({
        complaintId
      });
    } while (existingComplaint);

    const complaint = await Complaint.create({
      complaintId,
      user: req.userId,
      title: title.trim(),
      category: category.toLowerCase().trim(),
      location: location ? location.trim() : "",
      description: description.trim(),
      priority: priority ? priority.toLowerCase().trim() : "medium"
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      complaint: {
        id: complaint._id,
        complaintId: complaint.complaintId,
        title: complaint.title,
        status: complaint.status,
        createdAt: complaint.createdAt
      }
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit complaint."
    });
  }
});

/*
  GET /api/complaints/my
  Get complaints submitted by the logged-in user.
  This will be used by the dashboard.
*/
router.get("/my", authenticateUser, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      user: req.userId
    })
      .sort({ createdAt: -1 })
      .select(
        "complaintId title category location priority status createdAt updatedAt"
      );

    res.json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error("Get my complaints error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load your complaints."
    });
  }
});

/*
  GET /api/complaints/:complaintId
  Track a complaint using its complaint ID.
*/
/*
  GET /api/complaints/all

  Allows moderators to view all student complaints.
*/
router.get(
  "/all",
  authenticateUser,
  authenticateModerator,
  async (req, res) => {

    try {

      const complaints = await Complaint.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        complaints
      });

    } catch (error) {

      console.error(
        "Get all complaints error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to load complaints."
      });

    }

  }
);
router.get("/:complaintId", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId.toUpperCase()
    }).populate("user", "name email");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found."
      });
    }

    res.json({
      success: true,
      complaint: {
        complaintId: complaint.complaintId,
        title: complaint.title,
        category: complaint.category,
        location: complaint.location,
        description: complaint.description,
        priority: complaint.priority,
        status: complaint.status,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt
      }
    });
  } catch (error) {
    console.error("Track complaint error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to track complaint."
    });
  }
});
/*
  PATCH /api/complaints/:complaintId/resolve

  Admin resolves a complaint.

  1. Find complaint
  2. Change status to resolved
  3. Get student's email
  4. Send resolution email
*/
router.patch(
  "/:complaintId/resolve",
  authenticateUser,
  authenticateModerator,
  async (req, res) => {

    try {

      const complaint = await Complaint.findOne({
        complaintId: req.params.complaintId.toUpperCase()
      }).populate("user", "name email");

      if (!complaint) {

        return res.status(404).json({
          success: false,
          message: "Complaint not found."
        });

      }

      // Prevent sending the same resolution email repeatedly.
      if (complaint.status === "resolved") {

        return res.status(400).json({
          success: false,
          message: "Complaint is already resolved."
        });

      }

      // Update complaint status
      complaint.status = "resolved";
      await complaint.save();

      // Send resolution email to the student
      let emailSent = false;
      let emailDetail = null;

      if (!complaint.user || !complaint.user.email) {
        console.error(
          `[Resolver Warning] Student account or email not found for complaint ${complaint.complaintId}. User reference:`,
          complaint.user
        );
        emailDetail = "Student user account or registered email not found.";
      } else {
        try {
          const emailResult = await sendComplaintResolvedEmail({
            studentEmail: complaint.user.email,
            studentName: complaint.user.name,
            complaintId: complaint.complaintId,
            complaintTitle: complaint.title,
            category: complaint.category
          });

          if (emailResult && emailResult.success) {
            emailSent = true;
          }
        } catch (emailError) {
          console.error(
            `[Resolution Email Error for ${complaint.complaintId}]:`,
            emailError.message
          );
          emailDetail = emailError.message;
        }
      }

      let responseMessage;
      if (emailSent) {
        responseMessage = "Complaint resolved and email sent successfully.";
      } else if (
        emailDetail &&
        (emailDetail.includes("only send testing emails") ||
         emailDetail.includes("testing email address") ||
         emailDetail.includes("verify a domain"))
      ) {
        responseMessage = "Complaint resolved, but notification email could not be sent due to Resend testing restriction (domain unverified).";
      } else if (emailDetail) {
        responseMessage = `Complaint resolved, but notification email could not be sent: ${emailDetail}`;
      } else {
        responseMessage = "Complaint resolved, but notification email could not be sent.";
      }

      return res.json({
        success: true,
        message: responseMessage,
        emailSent,
        complaint: {
          complaintId: complaint.complaintId,
          status: complaint.status,
          updatedAt: complaint.updatedAt
        }
      });

    } catch (error) {

      console.error(
        "Resolve complaint error:",
        error
      );

      return res.status(500).json({

        success: false,

        message: "Unable to resolve complaint."

      });

    }

  });
module.exports = router;
