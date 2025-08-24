import mongoose, { Schema, type Document } from "mongoose"

export interface IRating extends Document {
  userId: mongoose.Types.ObjectId
  movieId: string
  rating: number
  review?: string
  createdAt: Date
  updatedAt: Date
}

const RatingSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    review: { type: String, maxlength: 1000 },
  },
  { timestamps: true },
)

// Compound index to ensure one rating per user per movie
RatingSchema.index({ userId: 1, movieId: 1 }, { unique: true })

export default mongoose.models.Rating || mongoose.model<IRating>("Rating", RatingSchema)
