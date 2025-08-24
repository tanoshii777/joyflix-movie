import mongoose from "mongoose"

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      movieRequests: { type: Boolean, default: true },
      movieAvailable: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true },
      adminMessages: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
    push: {
      movieRequests: { type: Boolean, default: true },
      movieAvailable: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: false },
      adminMessages: { type: Boolean, default: true },
    },
    inApp: {
      movieRequests: { type: Boolean, default: true },
      movieAvailable: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true },
      adminMessages: { type: Boolean, default: true },
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: "22:00" },
      endTime: { type: String, default: "08:00" },
      timezone: { type: String, default: "UTC" },
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.NotificationPreference ||
  mongoose.model("NotificationPreference", notificationPreferenceSchema)
