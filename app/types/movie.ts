// app/types/movie.ts

// 🎬 Movie type
export interface Movie {
  id: number;
  title: string;
  year: number; // ✅ release year
  thumbnail: string; // poster image
  video: string; // video source (URL or path)
  startTime?: number; // optional start time in seconds
  category: string; // e.g. "Action", "Drama"
  subtitle?: string; // optional subtitle/ tagline
  description: string; // movie description
  rating?: string; // optional rating like "8.5"
}

// 🦸 Props for the Hero component
export interface HeroProps {
  movies: Movie[];
}

// (Optional) Props for MovieDetails if you need them later
export interface MovieDetailsProps {
  movie: Movie;
}
