const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    platform: {
      type: String,
      enum: ["instagram", "facebook", "twitter", "tiktok"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "posted"],
      default: "draft",
    },
    scheduledDate: {
      type: Date,
    },
    media: [
      {
        type: {
          type: String,
          enum: ["url", "file"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    tags: [String],
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk pencarian
todoSchema.index({ title: "text", content: "text" });

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
