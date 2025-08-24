import mongoose, { Schema, type Document } from "mongoose";

export interface IMovieRequest extends Document {
  movieId: string;
  title: string;
  year?: number;
  user: string;
  status: "pending" | "approved" | "downloaded" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}

const MovieRequestSchema: Schema = new Schema(
  {
    movieId: { type: String, required: true },
    title: { type: String, required: true },
    year: { type: Number },
    user: { type: String, required: true, default: "guest" },
    status: {
      type: String,
      enum: ["pending", "approved", "downloaded", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

// Create index for efficient queries
MovieRequestSchema.index({ movieId: 1, status: 1 });
MovieRequestSchema.index({ user: 1 });

export default mongoose.models.MovieRequest ||
  mongoose.model<IMovieRequest>("MovieRequest", MovieRequestSchema);
