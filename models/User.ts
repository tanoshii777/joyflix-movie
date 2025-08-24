import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  fullName: string
  username: string
  email: string
  password: string
  profileImage?: string
  bio?: string
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  preferences?: {
    emailNotifications: boolean
    pushNotifications: boolean
    marketingEmails: boolean
    autoplay: boolean
    quality: "auto" | "720p" | "1080p" | "4k"
    language: string
  }
  watchlist: string[]
  favorites: string[]
  theme: "light" | "dark"
  lastLogin?: Date
  loginCount: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    location: { type: String, default: "", maxlength: 100 },
    website: { type: String, default: "", maxlength: 200 },
    socialLinks: {
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      autoplay: { type: Boolean, default: true },
      quality: { type: String, enum: ["auto", "720p", "1080p", "4k"], default: "auto" },
      language: { type: String, default: "en" },
    },
    watchlist: [{ type: String, default: [] }],
    favorites: [{ type: String, default: [] }],
    theme: { type: String, enum: ["light", "dark"], default: "dark" },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
