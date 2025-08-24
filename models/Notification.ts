import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "movie_request", "movie_available", "system", "admin"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    category: {
      type: String,
      enum: ["general", "movie", "account", "system", "admin"],
      default: "general",
    },
    expiresAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
    },
    actionText: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, read: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema)
