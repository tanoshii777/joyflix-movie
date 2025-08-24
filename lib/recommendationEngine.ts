import { movies } from "@/app/moviesData"
import type { Movie } from "@/app/types/movie"

export interface UserPreferences {
  favoriteGenres: string[]
  averageRating: number
  watchedMovies: string[]
  ratedMovies: { [movieId: string]: number }
  favoriteMovies: string[]
  watchlistMovies: string[]
}

export class RecommendationEngine {
  private movies: Movie[]

  constructor(movieData: Movie[] = movies) {
    this.movies = movieData
  }

  // Content-based filtering using movie attributes
  getContentBasedRecommendations(userPrefs: UserPreferences, limit = 10): Movie[] {
    const { favoriteGenres, watchedMovies, ratedMovies } = userPrefs

    // Get highly rated movies by user to understand preferences
    const highlyRatedMovies = Object.entries(ratedMovies)
      .filter(([_, rating]) => rating >= 7)
      .map(([movieId]) => this.movies.find((m) => m.id === movieId))
      .filter(Boolean) as Movie[]

    // Extract preferred genres from highly rated movies
    const preferredGenres =
      highlyRatedMovies.length > 0 ? [...new Set(highlyRatedMovies.map((m) => m.category))] : favoriteGenres

    // Score movies based on genre preference and other factors
    const scoredMovies = this.movies
      .filter((movie) => !watchedMovies.includes(movie.id))
      .map((movie) => ({
        movie,
        score: this.calculateContentScore(movie, preferredGenres, userPrefs),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return scoredMovies.map((item) => item.movie)
  }

  // Collaborative filtering simulation (would use real user data in production)
  getCollaborativeRecommendations(userPrefs: UserPreferences, limit = 10): Movie[] {
    const { ratedMovies, watchedMovies } = userPrefs

    // Simulate finding similar users based on rating patterns
    const similarUserRatings = this.simulateSimilarUsers(ratedMovies)

    // Get movies highly rated by similar users
    const recommendations = this.movies
      .filter((movie) => !watchedMovies.includes(movie.id))
      .map((movie) => ({
        movie,
        score: similarUserRatings[movie.id] || 0,
      }))
      .filter((item) => item.score >= 7)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return recommendations.map((item) => item.movie)
  }

  // Trending/Popular recommendations
  getTrendingRecommendations(userPrefs: UserPreferences, limit = 10): Movie[] {
    const { watchedMovies } = userPrefs

    // Simulate popularity based on recent movies and common titles
    const popularKeywords = ["Avengers", "Spider-Man", "Batman", "Star Wars", "Marvel", "DC"]

    return this.movies
      .filter((movie) => !watchedMovies.includes(movie.id))
      .filter((movie) => movie.year && movie.year >= 2018) // Recent movies
      .sort((a, b) => {
        const aPopular = popularKeywords.some((keyword) => a.title.toLowerCase().includes(keyword.toLowerCase()))
          ? 1
          : 0
        const bPopular = popularKeywords.some((keyword) => b.title.toLowerCase().includes(keyword.toLowerCase()))
          ? 1
          : 0

        if (aPopular !== bPopular) return bPopular - aPopular
        return (b.year || 0) - (a.year || 0)
      })
      .slice(0, limit)
  }

  // Hybrid recommendation combining multiple approaches
  getHybridRecommendations(userPrefs: UserPreferences, limit = 12): Movie[] {
    const contentBased = this.getContentBasedRecommendations(userPrefs, 6)
    const collaborative = this.getCollaborativeRecommendations(userPrefs, 4)
    const trending = this.getTrendingRecommendations(userPrefs, 2)

    // Combine and deduplicate
    const combined = [...contentBased, ...collaborative, ...trending]
    const unique = combined.filter((movie, index, self) => self.findIndex((m) => m.id === movie.id) === index)

    return unique.slice(0, limit)
  }

  private calculateContentScore(movie: Movie, preferredGenres: string[], userPrefs: UserPreferences): number {
    let score = 0

    // Genre preference (40% weight)
    if (preferredGenres.includes(movie.category)) {
      score += 4
    }

    // Recency bonus (20% weight)
    if (movie.year && movie.year >= 2020) {
      score += 2
    } else if (movie.year && movie.year >= 2015) {
      score += 1
    }

    // Popular titles bonus (20% weight)
    const popularKeywords = ["Avengers", "Spider-Man", "Batman", "Star Wars"]
    if (popularKeywords.some((keyword) => movie.title.toLowerCase().includes(keyword.toLowerCase()))) {
      score += 2
    }

    // Diversity bonus (20% weight) - prefer movies from different categories
    const watchedCategories = Object.keys(userPrefs.ratedMovies)
      .map((id) => this.movies.find((m) => m.id === id)?.category)
      .filter(Boolean)

    const categoryCount = watchedCategories.filter((cat) => cat === movie.category).length
    if (categoryCount < 3) {
      // Less watched category gets bonus
      score += 2
    }

    return score
  }

  private simulateSimilarUsers(userRatings: { [movieId: string]: number }): { [movieId: string]: number } {
    // Simulate collaborative filtering by creating synthetic similar user preferences
    const similarUserRatings: { [movieId: string]: number } = {}

    // For movies the user rated highly, recommend similar movies
    Object.entries(userRatings).forEach(([movieId, rating]) => {
      if (rating >= 7) {
        const movie = this.movies.find((m) => m.id === movieId)
        if (movie) {
          // Find movies in same category and give them high ratings
          this.movies
            .filter((m) => m.category === movie.category && m.id !== movieId)
            .forEach((similarMovie) => {
              similarUserRatings[similarMovie.id] = Math.min(10, rating + Math.random() * 2 - 1)
            })
        }
      }
    })

    return similarUserRatings
  }
}

export const recommendationEngine = new RecommendationEngine()
