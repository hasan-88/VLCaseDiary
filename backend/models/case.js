const mongoose = require("mongoose");

const FileItemSchema = new mongoose.Schema(
  {
    name: String,
    type: {
      type: String,
      enum: ["file", "note"],
    },
    fileId: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      url: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    caseNo: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "hearing"],
      default: "pending",
    },
    courtName: {
      type: String,
      required: true,
    },
    nextHearing: {
      type: Date,
      required: true,
    },
    partyName: {
      type: String,
      required: true,
    },
    respondent: {
      type: String,
      required: true,
    },
    lawyer: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    advocateContactNumber: {
      type: String,
    },
    adversePartyAdvocateName: {
      type: String,
    },
    caseYear: {
      type: Number,
      required: true,
    },
    onBehalfOf: {
      type: String,
      required: true,
      enum: [
        "Petitioner",
        "Respondent",
        "Complainant",
        "Accused",
        "Plaintiff",
        "DHR",
        "JDR",
        "Appellant",
      ],
    },
    description: {
      type: String,
    },
    // File sections
    drafts: [FileItemSchema],
    opponentDrafts: [FileItemSchema],
    courtOrders: [FileItemSchema],
    evidence: [FileItemSchema],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for case number uniqueness per user
CaseSchema.index({ caseNo: 1, userId: 1 }, { unique: true });

// Create index for faster queries
CaseSchema.index({ userId: 1, status: 1 });
CaseSchema.index({ userId: 1, nextHearing: 1 });
CaseSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Case", CaseSchema);
