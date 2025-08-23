// app/types/movie.ts
export interface Movie {
  id: number;
  title: string;
  year: number; // ✅ add this
  thumbnail: string;
  video: string;
  startTime?: number;
  category: string;
  subtitle?: string;
  description: string;
}
