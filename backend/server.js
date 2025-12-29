const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Models
const User = require("./models/user");
const Case = require("./models/case");
const Note = require("./models/note");

// Middleware
const authMiddleware = require("./middleware/auth");

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed"));
    }
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/voiceoflaw")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    console.error("Make sure MongoDB is running on your system!");
    process.exit(1);
  });

// Enhanced Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Enhanced Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Voice of Law Server is running successfully",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ==================== AUTHENTICATION ROUTES ====================

// Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("Register request received:", {
      email: req.body.email,
      name: req.body.name,
    });

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("Missing fields in registration");
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    if (password.length < 6) {
      console.log("Password too short");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();
    console.log("User created successfully:", user.email);

    const payload = { user: { id: user.id } };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret_key_here_change_in_production",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration: " + error.message,
    });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("Login request received:", { email: req.body.email });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("User found, checking password...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Password matched, generating token...");
    const payload = { user: { id: user.id } };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret_key_here_change_in_production",
      { expiresIn: "7d" }
    );

    console.log("Login successful for user:", email);
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login: " + error.message,
    });
  }
});

// Get User Profile
app.get("/api/auth/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile: " + error.message,
    });
  }
});

// ==================== DASHBOARD ROUTES ====================

// Get dashboard statistics
app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total cases
    const totalCases = await Case.countDocuments({ userId });

    // Get active cases (pending + hearing)
    const activeCases = await Case.countDocuments({
      userId,
      status: { $in: ["pending", "hearing"] },
    });

    // Get cases created this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekCases = await Case.countDocuments({
      userId,
      createdAt: { $gte: oneWeekAgo },
    });

    // Get status breakdown
    const pendingCases = await Case.countDocuments({
      userId,
      status: "pending",
    });
    const hearingCases = await Case.countDocuments({
      userId,
      status: "hearing",
    });
    const completedCases = await Case.countDocuments({
      userId,
      status: "completed",
    });

    res.json({
      success: true,
      data: {
        total: totalCases,
        active: activeCases,
        thisWeek: thisWeekCases,
        pending: pendingCases,
        hearing: hearingCases,
        completed: completedCases,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard stats",
    });
  }
});

// Get upcoming hearings
app.get("/api/dashboard/hearings", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get upcoming hearings (next 30 days)
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const upcomingHearings = await Case.find({
      userId,
      nextHearing: {
        $gte: today,
        $lte: thirtyDaysLater,
      },
    })
      .sort({ nextHearing: 1 })
      .limit(5)
      .select("title caseNo courtName nextHearing type status");

    res.json({
      success: true,
      data: upcomingHearings,
    });
  } catch (error) {
    console.error("Upcoming hearings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching upcoming hearings",
    });
  }
});

// Get recent activity
app.get("/api/dashboard/activity", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recently updated cases
    const recentCases = await Case.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title caseNo status updatedAt");

    // Format as activity feed
    const activities = recentCases.map((caseItem) => {
      let actionText = "";
      switch (caseItem.status) {
        case "pending":
          actionText = "Case status updated to pending";
          break;
        case "hearing":
          actionText = "Case status updated to hearing";
          break;
        case "completed":
          actionText = "Case marked as completed";
          break;
        default:
          actionText = "Case updated";
      }

      return {
        id: caseItem._id,
        title: `${caseItem.title} (${caseItem.caseNo})`,
        action: actionText,
        timestamp: caseItem.updatedAt,
        type: caseItem.status,
      };
    });

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching recent activity",
    });
  }
});

// Get monthly metrics
app.get("/api/dashboard/metrics", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Cases won this month (completed)
    const casesWon = await Case.countDocuments({
      userId,
      status: "completed",
      updatedAt: { $gte: startOfMonth },
    });

    // Total hearings this month
    const hearings = await Case.countDocuments({
      userId,
      nextHearing: { $gte: startOfMonth },
    });

    // Pending cases
    const pending = await Case.countDocuments({
      userId,
      status: "pending",
    });

    res.json({
      success: true,
      data: {
        casesWon,
        hearings,
        pending,
      },
    });
  } catch (error) {
    console.error("Monthly metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching monthly metrics",
    });
  }
});

// ==================== CASE MANAGEMENT ROUTES ====================

// Search cases
app.get("/api/cases/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const cases = await Case.find({
      userId: req.user.id,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { caseNo: { $regex: query, $options: "i" } },
        { partyName: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: cases,
    });
  } catch (error) {
    console.error("Search cases error:", error);
    res.status(500).json({
      success: false,
      message: "Server error searching cases",
    });
  }
});

// Get all cases for user
app.get("/api/cases", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const cases = await Case.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Case.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: cases,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get cases error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching cases: " + error.message,
    });
  }
});

// Get single case
app.get("/api/cases/:id", authMiddleware, async (req, res) => {
  try {
    const caseItem = await Case.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      data: caseItem,
    });
  } catch (error) {
    console.error("Get case error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching case",
    });
  }
});

// Create new case
app.post("/api/cases", authMiddleware, async (req, res) => {
  try {
    const caseData = {
      ...req.body,
      userId: req.user.id,
    };

    const existingCase = await Case.findOne({
      caseNo: caseData.caseNo,
      userId: req.user.id,
    });

    if (existingCase) {
      return res.status(400).json({
        success: false,
        message: "Case number already exists",
      });
    }

    const newCase = new Case(caseData);
    const savedCase = await newCase.save();

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: savedCase,
    });
  } catch (error) {
    console.error("Create case error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating case: " + error.message,
    });
  }
});

// Update case
app.put("/api/cases/:id", authMiddleware, async (req, res) => {
  try {
    const caseItem = await Case.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      message: "Case updated successfully",
      data: caseItem,
    });
  } catch (error) {
    console.error("Update case error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating case",
    });
  }
});

// Delete case
app.delete("/api/cases/:id", authMiddleware, async (req, res) => {
  try {
    const caseItem = await Case.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      message: "Case deleted successfully",
    });
  } catch (error) {
    console.error("Delete case error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting case",
    });
  }
});

// Update case status
app.patch("/api/cases/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "completed", "hearing"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const caseItem = await Case.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      message: "Case status updated successfully",
      data: caseItem,
    });
  } catch (error) {
    console.error("Update case status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating case status",
    });
  }
});

// Upload files to case
app.post(
  "/api/cases/:id/upload",
  authMiddleware,
  upload.array("files", 10),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { sectionType } = req.body;
      const files = req.files;

      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }

      const caseItem = await Case.findOne({ _id: id, userId: req.user.id });
      if (!caseItem) {
        return res
          .status(404)
          .json({ success: false, message: "Case not found" });
      }

      if (!caseItem[sectionType]) {
        caseItem[sectionType] = [];
      }

      for (const file of files) {
        const fileData = {
          name: file.originalname,
          type: "file",
          fileId: {
            _id: new mongoose.Types.ObjectId(),
            name: file.originalname,
            url: `/uploads/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt: new Date(),
          },
          addedAt: new Date(),
        };
        caseItem[sectionType].push(fileData);
      }

      await caseItem.save();

      res.json({
        success: true,
        message: "Files uploaded successfully",
        data: caseItem,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Upload failed" });
    }
  }
);

// Create note in case section
app.post("/api/cases/:id/notes", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionType, title, content = "" } = req.body;

    const caseItem = await Case.findOne({ _id: id, userId: req.user.id });
    if (!caseItem) {
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    }

    const note = new Note({
      title,
      content,
      userId: req.user.id,
    });
    await note.save();

    if (!caseItem[sectionType]) {
      caseItem[sectionType] = [];
    }

    caseItem[sectionType].push({
      name: title,
      type: "note",
      noteId: note._id,
      addedAt: new Date(),
    });

    await caseItem.save();

    res.json({
      success: true,
      message: "Note created successfully",
      data: caseItem,
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ success: false, message: "Failed to create note" });
  }
});

// Delete file from case
app.delete("/api/cases/:id/files/:fileId", authMiddleware, async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const caseItem = await Case.findOne({ _id: id, userId: req.user.id });

    if (!caseItem) {
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    }

    let fileFound = false;
    let fileDeleted = false;

    // Search through all sections
    const sections = ["drafts", "opponentDrafts", "courtOrders", "evidence"];

    for (const section of sections) {
      if (Array.isArray(caseItem[section])) {
        const fileIndex = caseItem[section].findIndex((item) => {
          if (item.type === "file" && item.fileId) {
            return (
              item.fileId._id.toString() === fileId ||
              (item.fileId.url && item.fileId.url.includes(fileId))
            );
          }
          if (item.type === "note" && item.noteId) {
            return item.noteId.toString() === fileId;
          }
          return false;
        });

        if (fileIndex !== -1) {
          const removedItem = caseItem[section][fileIndex];
          caseItem[section].splice(fileIndex, 1);
          fileFound = true;

          // Delete physical file if it's a file type
          if (
            removedItem.type === "file" &&
            removedItem.fileId &&
            removedItem.fileId.url
          ) {
            const filePath = path.join(__dirname, removedItem.fileId.url);
            fs.unlink(filePath, (err) => {
              if (err) console.error("File deletion error:", err);
            });
          }

          // Delete note from database if it's a note type
          if (removedItem.type === "note" && removedItem.noteId) {
            await Note.findByIdAndDelete(removedItem.noteId);
          }

          fileDeleted = true;
          break;
        }
      }
    }

    if (!fileFound) {
      return res
        .status(404)
        .json({ success: false, message: "File not found in case" });
    }

    await caseItem.save();

    res.json({
      success: true,
      message: "File deleted successfully",
      data: caseItem,
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ success: false, message: "Failed to delete file" });
  }
});

// Get case sections with populated data
app.get("/api/cases/:id/sections", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { section } = req.query;

    const caseItem = await Case.findOne({ _id: id, userId: req.user.id });

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // If specific section requested
    if (section) {
      const sectionData = caseItem[section] || [];

      // Populate note content for notes
      const populatedData = await Promise.all(
        sectionData.map(async (item) => {
          if (item.type === "note" && item.noteId) {
            const note = await Note.findById(item.noteId);
            return {
              ...item.toObject(),
              noteId: note,
            };
          }
          return item;
        })
      );

      return res.json({
        success: true,
        data: populatedData,
      });
    }

    // Return all sections
    const sections = {
      drafts: caseItem.drafts || [],
      opponentDrafts: caseItem.opponentDrafts || [],
      courtOrders: caseItem.courtOrders || [],
      evidence: caseItem.evidence || [],
    };

    res.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("Get case sections error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching case sections",
    });
  }
});

// ==================== NOTE ROUTES ====================

// Get all notes for user
app.get("/api/notes", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching notes",
    });
  }
});

// Get single note
app.get("/api/notes/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching note",
    });
  }
});

// Create new note
app.post("/api/notes", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const newNote = new Note({
      title,
      content,
      userId: req.user.id,
    });

    const savedNote = await newNote.save();

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: savedNote,
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating note",
    });
  }
});

// Update note
app.put("/api/notes/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, content },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating note",
    });
  }
});

// Delete note
app.delete("/api/notes/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting note",
    });
  }
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ==================== SERVER STARTUP ====================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Voice of Law Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 External access: http://192.168.100.181:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
