import mongoose, { Schema, Document, models } from "mongoose";

export interface IMovie extends Document {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  genre: string;
  duration: string;
  year: number; // ✅ Add this
  views?: number; // optional
  createdAt?: Date;
  updatedAt?: Date;
}

const MovieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: String, required: true },
    year: { type: Number, required: true }, // ✅ Add this
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Movie = models.Movie || mongoose.model<IMovie>("Movie", MovieSchema);
export default Movie;
