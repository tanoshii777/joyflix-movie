import mongoose, { Schema, type Document } from "mongoose"

export interface IPasswordReset extends Document {
  email: string
  token: string
  userId: mongoose.Types.ObjectId
  expiresAt: Date
  used: boolean
  createdAt: Date
}

const PasswordResetSchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// Index for cleanup of expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
PasswordResetSchema.index({ token: 1 })

export default mongoose.models.PasswordReset || mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema)
