import mongoose, { Schema, type Document } from "mongoose"

export interface IMovieStats extends Document {
  movieId: string
  totalRatings: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    7: number
    8: number
    9: number
    10: number
  }
  totalViews: number
  totalFavorites: number
  totalWatchlist: number
  lastUpdated: Date
}

const MovieStatsSchema: Schema = new Schema({
  movieId: { type: String, required: true, unique: true },
  totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 },
    6: { type: Number, default: 0 },
    7: { type: Number, default: 0 },
    8: { type: Number, default: 0 },
    9: { type: Number, default: 0 },
    10: { type: Number, default: 0 },
  },
  totalViews: { type: Number, default: 0 },
  totalFavorites: { type: Number, default: 0 },
  totalWatchlist: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
})

export default mongoose.models.MovieStats || mongoose.model<IMovieStats>("MovieStats", MovieStatsSchema)
