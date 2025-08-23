import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  fullName: string
  username: string
  email: string
  password: string
  profileImage?: string
  watchlist: string[]
  favorites: string[]
  theme: "light" | "dark"
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
    watchlist: [{ type: String, default: [] }],
    favorites: [{ type: String, default: [] }],
    theme: { type: String, enum: ["light", "dark"], default: "dark" },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
