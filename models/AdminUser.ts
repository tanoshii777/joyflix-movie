import mongoose, { Schema, type Document } from "mongoose"

export interface IAdminUser extends Document {
  username: string
  email: string
  password: string
  fullName: string
  role: "admin" | "super_admin"
  permissions: string[]
  isActive: boolean
  lastLogin?: Date
  loginCount: number
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  createdAt: Date
  updatedAt: Date
}

const AdminUserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },
    permissions: [
      {
        type: String,
        enum: [
          "view_dashboard",
          "manage_movies",
          "manage_users",
          "manage_requests",
          "view_analytics",
          "system_settings",
          "user_management",
          "content_moderation",
        ],
      },
    ],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
  },
  { timestamps: true },
)

// Default permissions for admin role
AdminUserSchema.pre("save", function (next) {
  if (this.isNew && this.role === "admin" && this.permissions.length === 0) {
    this.permissions = ["view_dashboard", "manage_movies", "manage_requests", "view_analytics"]
  } else if (this.isNew && this.role === "super_admin" && this.permissions.length === 0) {
    this.permissions = [
      "view_dashboard",
      "manage_movies",
      "manage_users",
      "manage_requests",
      "view_analytics",
      "system_settings",
      "user_management",
      "content_moderation",
    ]
  }
  next()
})

export default mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema)
